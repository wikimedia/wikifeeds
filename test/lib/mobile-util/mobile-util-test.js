'use strict';

const assert = require('../../utils/assert');
const mUtil = require('../../../lib/mobile-util');
const domino = require('domino');

describe('lib:mobile-util', () => {

    it('removeTLD should remove TLD', () => {
        assert.deepEqual(mUtil.removeTLD('ru.wikipedia.org'), 'ru.wikipedia');
    });

    it('URL fragments should be stripped correctly', () => {
        assert.deepEqual(mUtil.removeFragment('100_metres_hurdles#Top_25_fastest_athletes'),
            '100_metres_hurdles');
        assert.deepEqual(mUtil.removeFragment('Kendra_Harrison'), 'Kendra_Harrison');
    });

    it('removeLinkPrefix should strip the ./ correctly', () => {
        assert.deepEqual(mUtil.removeLinkPrefix('./100_metres_hurdles#Top_25_fastest_athletes'),
            '100_metres_hurdles#Top_25_fastest_athletes');
        assert.deepEqual(mUtil.removeLinkPrefix('Kendra_Harrison'), 'Kendra_Harrison');
    });

    it('extractDbTitleFromAnchor should get the right parts of the href', () => {
        const linkHtml = `<html><head><base href="//en.wikipedia.org/wiki/"/></head></html><body>
<a href="./My_db_title">foo bar</a></body></html>`;
        const document = domino.createDocument(linkHtml);
        const link = document.querySelector('a');
        assert.deepEqual(mUtil.extractDbTitleFromAnchor(link), 'My_db_title');
    });

    it('mwApiTrue handles formatversions 1 and 2', () => {
        const test = { true1: '', true2: true, false2: false };
        assert.deepEqual(mUtil.mwApiTrue(test, 'true1'), true);
        assert.deepEqual(mUtil.mwApiTrue(test, 'true2'), true);
        assert.deepEqual(mUtil.mwApiTrue(test, 'false1'), false);
        assert.deepEqual(mUtil.mwApiTrue(test, 'false2'), false);
    });

    it('getLanguageFromDomain gets lang code if domain has >2 levels', () => {
        assert.deepEqual(mUtil.getLanguageFromDomain('en.wikipedia.org'), 'en');
        assert.deepEqual(mUtil.getLanguageFromDomain('de.wikipedia.beta.wmflabs.org'), 'de');
        assert.deepEqual(mUtil.getLanguageFromDomain('mediawiki.org'), undefined);
    });

    it('domainForLangCode swaps in lang code if domain has >2 levels', () => {
        assert.deepEqual(mUtil.domainForLangCode('en.wikipedia.org', 'de'), 'de.wikipedia.org');
        assert.deepEqual(mUtil.domainForLangCode('de.wikipedia.beta.wmflabs.org', 'ja'), 'ja.wikipedia.beta.wmflabs.org');  // eslint-disable-line max-len
        assert.deepEqual(mUtil.domainForLangCode('mediawiki.org', 'es'), 'mediawiki.org');
    });
});
