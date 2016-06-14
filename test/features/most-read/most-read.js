'use strict';

var preq = require('preq');
var assert = require('../../utils/assert');
var mUtil = require('../../../lib/mobile-util');
var server = require('../../utils/server');
var headers = require('../../utils/headers');
var dateUtil = require('../../../lib/dateUtil');
var BLACKLIST = require('../../../etc/feed/blacklist');

var date = new Date();
date.setDate(date.getDate() - 5);
var dateString = date.getUTCFullYear() + '/' + dateUtil.pad(date.getUTCMonth()) + '/' + dateUtil.pad(date.getUTCDate());

describe('most-read articles', function() {
    this.timeout(20000);

    before(function () { return server.start(); });

    it('should respond to GET request with expected headers, incl. CORS and CSP headers', function() {
        return headers.checkHeaders(server.config.uri + 'en.wikipedia.org/v1/page/most-read/' + dateString,
            'application/json');
    });
    it('results list should have expected properties', function() {
        return preq.get({ uri: server.config.uri + 'en.wikipedia.org/v1/page/most-read/' + dateString })
          .then(function(res) {
              assert.deepEqual(res.status, 200);
              assert.ok(res.body.date);
              assert.ok(res.body.articles.length);
              res.body.articles.forEach(function (elem) {
                  assert.ok(elem.title, 'title should be present');
                  assert.ok(elem.normalizedtitle, 'normalizedtitle should be present');
                  assert.ok(elem.views, 'views should be present');
                  assert.ok(elem.rank, 'rank should be present');
                  assert.ok(elem.pageid, 'pageid should be present');
                  assert.ok(BLACKLIST.indexOf(elem.title) === -1, 'Should not include blacklisted title');
                  assert.ok(elem.title !== 'Main_Page', 'Should not include the Main Page');
                  assert.ok(elem.title.indexOf('Special:') === -1, 'Should not include Special page');
              });
          });
    });
    it('Request to mobile domain should complete successfully', function() {
        return preq.get({ uri: server.config.uri + 'en.m.wikipedia.org/v1/page/most-read/' + dateString })
          .then(function(res) {
              assert.deepEqual(res.status, 200);
          });
    });
});