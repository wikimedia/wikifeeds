/**
 * mobileapp provides page content for the Mobile Apps.
 * The goal is to avoid having to use a web view and style the content natively inside the app
 * using plain TextViews.
 * The payload should not have any extra data, and should be easy to consume by the apps.
 *
 * Status: Prototype -- not ready for production
 * Currently using the mobileview action MW API, and removing some data we don't display.
 * TODO: Try Parsoid
 * TODO: add some transformations that currently are being done by the apps and remove some more unneeded data
 */

'use strict';

var BBPromise = require('bluebird');
var preq = require('preq');
var domino = require('domino');
var sUtil = require('../lib/util');

// shortcut
var HTTPError = sUtil.HTTPError;


/**
 * The main router object
 */
var router = sUtil.router();

/**
 * The main application object reported when this module is require()d
 */
var app;

// gallery constants:
var MAX_ITEM_COUNT = "256";
var MIN_IMAGE_SIZE = 64;


/**
 * A helper function that obtains the HTML from the MW API and
 * loads it into a domino DOM document instance.
 *
 * @param {String} domain the domain to contact
 * @param {Object} params an Object with all the query parameters for the MW API
 * @return {Promise} a promise resolving as the HTML element object
 */
function apiGet(domain, params) {
    // get the page from the MW API
    return preq.get({
        uri: 'http://' + domain + '/w/api.php',
        query: params
    });
}

function rmSelectorAll(doc, selector) {
    var ps = doc.querySelectorAll(selector) || [];
    for (var idx = 0; idx < ps.length; idx++) {
        var node = ps[idx];
        node.parentNode.removeChild(node);
    }
}

function moveFirstParagraphUpInLeadSection(text) {
    var doc = domino.createDocument(text);
    // TODO: mhurd, feel free to add your magic here
    return doc.body.innerHTML;
}

/**
 * Nukes stuff from the DOM we don't want.
 */
function runDomTransforms(text) {
    var doc = domino.createDocument(text);
    rmSelectorAll(doc, 'div.noprint');
    rmSelectorAll(doc, 'div.infobox');
    rmSelectorAll(doc, 'div.hatnote');
    rmSelectorAll(doc, 'div.metadata');
    rmSelectorAll(doc, 'table'); // TODO: later we may want to transform some of the tables into a JSON structure
    return doc.body.innerHTML;
}

function checkApiResult(apiRes) {
    // check if the query failed
    if (apiRes.status > 299) {
        // there was an error in the MW API, propagate that
        throw new HTTPError({
            status: apiRes.status,
            type: 'api_error',
            title: 'MW API error',
            detail: apiRes.body
        });
    }
}

/** Gets the page content from MW API mobileview */
function getPage(req) {
    return apiGet(req.params.domain, {
        "action": "mobileview",
        "format": "json",
        "page": req.params.title,
        "prop": "text|sections|thumb|image|id|revision|description|lastmodified|normalizedtitle|displaytitle|protection|editable",
        "sections": "all",
        "sectionprop": "toclevel|line|anchor",
        "noheadings": true,
        "noimages": true
    })
        .then(function (apiRes) {
            checkApiResult(apiRes);

            // transform all sections
            var sections = apiRes.body.mobileview.sections;
            for (var idx = 0; idx < sections.length; idx++) {
                var section = sections[idx];
                section.text = runDomTransforms(section.text);
            }

            if (!apiRes.body.mobileview.mainpage) {
                // don't do anything if this is the main page, since many wikis
                // arrange the main page in a series of tables.
                // TODO: should we also exclude file and other special pages?
                section.text = moveFirstParagraphUpInLeadSection(section.text);
            }

            return apiRes.body.mobileview;
        });
}

/** Gets the gallery content from MW API */
function getGalleryCollection(req) {
    return apiGet(req.params.domain, {
        "action": "query",
        "format": "json",
        "titles": req.params.title,
        "continue": "",
        "prop": "imageinfo",
        "iiprop": "dimensions|mime",
        "generator": "images",
        "gimlimit": MAX_ITEM_COUNT
    })
        .then(function (apiRes) {
            checkApiResult(apiRes);

            // iterate over all images
            var images = apiRes.body.query.pages;
            for (var key in images) {
                if (images.hasOwnProperty(key)) {
                    var image = images[key];

                    // remove the ones that are too small or are of the wrong type
                    var imageinfo = image.imageinfo[0];  // TODO: why this is an array?

                    // Reject gallery items if they're too small.
                    // Also reject SVG and PNG items by default, because they're likely to be
                    // logos and/or presentational images.
                    if (imageinfo.width < MIN_IMAGE_SIZE
                        || imageinfo.height < MIN_IMAGE_SIZE
                        || imageinfo.mime.indexOf("svg") > -1
                        || imageinfo.mime.indexOf("png") > -1
                    ) {
                        delete images[key];
                    } else {
                        delete image.ns;
                        delete image.imagerepository; // we probably don't care where the repo is
                        delete imageinfo.size;

                        // TODO request more info
                    }
                }
            }

            return apiRes.body;
        });
}

/**
 * GET {domain}/v1/mobileapp/{title}
 * Gets the mobile app version of a given wiki page.
 */
router.get('/mobileapp/:title', function (req, res) {
    BBPromise.join(
        getPage(req),
        getGalleryCollection(req),

        function(page, gallery) {
            var result = {
                "page": page,
                "gallery": gallery
            };
            res.status(200).type('json').end(JSON.stringify(result));
        }
    );
});

module.exports = function (appObj) {
    app = appObj;
    return {
        path: '/',
        api_version: 1,
        router: router
    };
};
