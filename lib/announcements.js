'use strict';

const config = require('../etc/announcements');
const HTTPError = require('./util').HTTPError;
const striptags = require('striptags');

const plaintextFromHTML = (html) => {
    const htmlWithSpacesAndNewlines = html.replace(/&nbsp;/ig, ' ').replace(/<br\/>/ig, '\n');
    return striptags(htmlWithSpacesAndNewlines);
};

/**
 * @param {!Object} campaign object, as seen in etc/announcements.js
 * @param {!string} os operating system, all caps ('IOS' or 'ANDROID')
 * @param {?string} id another string to distinguish different announcements, all caps
 * @return {!string} announcement id string
 */
const buildId = (campaign, os, id) => `${campaign.idPrefix}${os}${id}`;

const baseAnnouncement = (campaign) => {
    return {
        type: campaign.type,
        start_time: campaign.startTime,
        end_time: campaign.endTime,
        domain: campaign.domain
    };

    // beta: true,
    // logged_in: true,
    // reading_list_sync_enabled: true,
};

const getFundraisingAnnouncementText = (countryConfig) => `To all our readers in ${countryConfig.country},<br/><br/>It's a little awkward, so we'll get straight to the point: Today we humbly ask you to defend Wikipedia's independence. 98% of our readers don't give; they simply look the other way. If you are an exceptional reader who has already donated, we sincerely thank you. <b>If you donate just ${countryConfig.currency}${countryConfig.coffee}, Wikipedia could keep thriving for years.</b> Most people donate because Wikipedia is useful. If Wikipedia has given you ${countryConfig.currency}${countryConfig.coffee} worth of knowledge this year, take a minute to donate. Show the volunteers who bring you reliable, neutral information that their work matters. Thank you.`;
/* eslint-enable max-len */

const androidV2FundraisingAnnouncement = (code, countryConfig, campaign) => {
    return Object.assign({}, baseAnnouncement(campaign), {
        id: buildId(campaign, 'ANDROIDV2', 'EN'),
        platforms: [ config.Platform.ANDROID_V2 ],
        countries: [ code.toUpperCase() ],
        border: countryConfig.border,
        placement: countryConfig.placement,
        text: getFundraisingAnnouncementText(countryConfig),
        // image_url: countryConfig.imageUrl,
        // image_height: 40,
        caption_HTML: "By donating, you agree to our <a href='https://foundation.wikimedia.org/wiki/Donor_privacy_policy/en'>donor policy</a>.",
        negative_text: 'No thanks',
        action: {
            title: 'DONATE NOW',
            url: 'https://donate.wikimedia.org/?uselang=en&appeal=JimmyQuote&utm_medium=WikipediaApp&utm_campaign=Android&utm_source=app_2020_6C_Android_control'
        }
    });
};

const androidV2SurveyAnnouncement = (campaign) => {
    return Object.assign({}, baseAnnouncement(campaign), {
        id: buildId(campaign, 'ANDROIDV2', 'EN'),
        platforms: [ config.Platform.ANDROID_V2 ],
        countries: [ 'AL', 'DZ', 'AO', 'AR', 'AM', 'AU', 'AT', 'AZ', 'BD', 'BY', 'BR', 'BG', 'CM', 'CA', 'CF', 'TD',
            'CL', 'CO', 'KM', 'CR', 'CI', 'HR', 'CY', 'CZ', 'DK', 'EC', 'EG', 'SV', 'EE', 'ET', 'DE', 'GH', 'GR', 'GT',
            'GN', 'HN', 'HK', 'HU', 'IN', 'ID', 'IE', 'IT', 'JM', 'JP', 'KE', 'KR', 'LV', 'LB', 'LT', 'MG', 'MW', 'MY',
            'ML', 'MQ', 'MR', 'MX', 'MA', 'MZ', 'NL', 'NG', 'PK', 'PY', 'PE', 'PH', 'PL', 'PT', 'PR', 'RO', 'SN', 'RS',
            'SG', 'SK', 'SI', 'ZA', 'ES', 'SE', 'CH', 'TW', 'TZ', 'TN', 'TR', 'UG', 'GB', 'US', 'UY', 'ZM', 'ZW' ],
        border: false,
        placement: 'feed',
        text: 'Help to improve the Wikipedia mobile apps by signing up to be a user tester. Take a quick survey to participate in an upcoming study or research interview.',
        caption_HTML: "View our <a href='https://foundation.m.wikimedia.org/w/index.php?title=Editing_Awareness_and_Trust_Survey_Privacy_Statement'>privacy statement</a>. Survey powered by a third party. View their <a href='https://policies.google.com/privacy'>privacy policy</a>.",
        negative_text: 'No thanks',
        action: {
            title: 'Start survey',
            url: 'https://forms.gle/DUWfFRoD9nqgStJZ7'
        }
    });
};

const iosV2FundraisingAnnouncement = (code, countryConfig, campaign) => {
    return Object.assign({}, baseAnnouncement(campaign), {
        id: buildId(campaign, 'IOSV2', 'EN'),
        platforms: [ config.Platform.IOS_V2, config.Platform.IOS_V3, config.Platform.IOS_V4 ],
        countries: [ code.toUpperCase() ],
        border: countryConfig.border,
        placement: countryConfig.placement,
        text: getFundraisingAnnouncementText(countryConfig),
        caption_HTML: "By donating, you agree to our <a href='https://foundation.wikimedia.org/wiki/Donor_privacy_policy/en'>donor policy</a>.",
        negative_text: 'No thanks',
        action: {
            title: 'DONATE NOW',
            url: 'https://donate.wikimedia.org/?uselang=en&appeal=JimmyQuote&utm_medium=WikipediaApp&utm_campaign=iOS&utm_source=app_2020_6C_iOS_control'
        }
    });
};

const iosV4SurveyAnnouncement = (campaign) => {
    return Object.assign({}, baseAnnouncement(campaign), {
        id: buildId(campaign, 'IOSV4', 'EN'),
        platforms: [ config.Platform.IOS_V4 ],
        border: false,
        placement: 'article',
        text: 'Help improve Wikipedia by taking a quick survey about this article',
        caption_HTML: "View our <a href='https://foundation.m.wikimedia.org/w/index.php?title=Editing_Awareness_and_Trust_Survey_Privacy_Statement'>privacy statement</a>. Survey powered by a third-party. View their <a href='https://policies.google.com/privacy'>privacy policy</a>.",
        negative_text: 'No thanks',
        percent_receiving_experiment: 50,
        action: {
            title: 'Start survey',
            url: 'https://docs.google.com/forms/d/e/1FAIpQLScwLTsJ0--NQzWWDWu2JbhR3zQRzjSH3BO7mNo0Pd7xPmLowg/viewform?usp=pp_url&entry.135304298={{articleTitle}}&entry.1794192386={{didSeeModal}}&entry.1315551869={{isInExperiment}}'
        },
        articleTitles: [
            'Amy Coney Barrett',
            'Shooting of Breonna Taylor',
            'Dennis Nilsen',
            'Mulan (2020 film)',
            'The Boys (2019 TV series)',
            'Bible',
            'Joe Biden',
            'Ratched (TV series)',
            'Cobra Kai',
            'Chadwick Boseman',
            'Microsoft Office',
            'Enola Holmes (film)',
            'The Devil All the Time (film)',
            'Proud Boys',
            'Donald Trump',
            'Cuties',
            'QAnon',
            'Naomi Osaka',
            'Among Us',
            'Lovecraft Country (TV series)',
            'Periodic table',
            'YouTube',
            'Supreme Court of the United States',
            'Dune (2021 film)',
            'Nurse Ratched',
            'Ralph Macchio',
            'Sarah Paulson',
            'Beau Biden',
            'LeBron James',
            'Kamala Harris',
            '2020 United States presidential election',
            'Chernobyl disaster',
            'United States',
            'Wikipedia',
            'Lists of deaths by year#2019',
            'Parasite (2019 film)',
            'Deaths in 2020',
            'COVID-19 pandemic',
            'The Last of Us Part II',
            'Capitol Hill Autonomous Zone',
            'Elon Musk',
            'Black Lives Matter',
            'Anthony Fauci',
            'Afghanistan',
            'Antifa (United States)',
            'Death of Elijah McClain',
            'Karen (pejorative)',
            'Boogaloo movement'
        ],
        displayDelay: 30
    });
};

const iosLegacyFundraisingAnnouncement = (code, countryConfig, campaign) => {
    return Object.assign({}, baseAnnouncement(campaign), {
        id: buildId(campaign, 'IOS', 'EN'),
        platforms: [ config.Platform.IOS ],
        countries: [ code.toUpperCase() ],
        min_version: '5.8.0',
        max_version: '6.1.0',
        caption_HTML: "<p>By donating, you agree to our <a href='https://foundation.wikimedia.org/wiki/Donor_privacy_policy/en'>donor policy</a></p>.",
        border: countryConfig.border,
        placement: countryConfig.placement,
        text: plaintextFromHTML(getFundraisingAnnouncementText(countryConfig)),
        action: {
            title: 'DONATE NOW',
            url: 'https://donate.wikimedia.org/?uselang=en&appeal=JimmyQuote&utm_medium=WikipediaApp&utm_campaign=iOS&utm_source=app_2020_6C_iOS_control'
        }
    });
};

function getAndroidFundraisingAnnouncements(campaign) {
    return Object.keys(campaign.countryVars)
    .map((code) => androidV2FundraisingAnnouncement(code, campaign.countryVars[code], campaign));
}

function getAndroidSurveyAnnouncements(campaign) {
    return [].concat(androidV2SurveyAnnouncement(campaign));
}

function getiOSFundraisingAnnouncements(campaign) {
    return Object.keys(campaign.countryVars)
    .map((code) => iosV2FundraisingAnnouncement(code, campaign.countryVars[code], campaign));
}

function getiOSSurveyAnnouncements(campaign) {
    return [].concat(iosV4SurveyAnnouncement(campaign));
}

function getLegacyiOSFundraisingAnnouncements(campaign) {
    return Object.keys(campaign.countryVars)
    .map((code) => iosLegacyFundraisingAnnouncement(code, campaign.countryVars[code], campaign));
}

function getAnnouncementsForCampaign(campaign) {
    switch (campaign.idPrefix) {
        case 'FUNDRAISING20':
            return getAndroidFundraisingAnnouncements(campaign)
            .concat(getiOSFundraisingAnnouncements(campaign))
            .concat(getLegacyiOSFundraisingAnnouncements(campaign));
        case 'IOSSURVEY20':
            return getiOSSurveyAnnouncements(campaign);
        case 'ANDROIDSURVEY20':
            return getAndroidSurveyAnnouncements(campaign);
    }
}

function hasEnded(campaign, now) {
    const endDate = Date.parse(campaign.endTime);
    if (isNaN(endDate)) {
        throw new HTTPError({
            status: 500,
            type: 'config_error',
            title: 'invalid end date in announcements config',
            detail: config.endTime
        });
    }
    return now > endDate;
}

function getActiveCampaigns(domain, now) {
    return config.campaigns.filter((campaign) =>
    campaign.activeWikis.includes(domain) &&
    !hasEnded(campaign, now));
}

function getAnnouncements(domain) {
    const announcements = [];
    const activeCampaigns = getActiveCampaigns(domain, new Date());
    activeCampaigns.forEach((campaign) => {
        announcements.push(...getAnnouncementsForCampaign(campaign));
    });

    return {
        announce: announcements
    };
}

module.exports = {
    getAnnouncements,
    testing: {
        buildId,
        getActiveCampaigns,
        getAnnouncementsForCampaign,
        getAndroidFundraisingAnnouncements,
        getiOSFundraisingAnnouncements,
        getLegacyiOSFundraisingAnnouncements,
        hasEnded
    }
};
