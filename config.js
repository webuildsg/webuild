var city = 'Singapore';
var country = 'Singapore';
var locationSymbol = 'SG';

function failSafeRequire(filename){
  var requiredData;
  try {
   requiredData  = require(filename);
  }
  catch(e){
    requiredData = [];
  }
  return requiredData;
}

var facebookGroups = failSafeRequire('./config/facebookGroups.json');
var blacklistEvents = failSafeRequire('./config/blacklistEvents.json');
var icsGroups = failSafeRequire('./config/icsGroups.json');
var whitelistEvents = failSafeRequire('./config/whitelistEvents.json');
var duplicateWords = require('./config/duplicateWords.json');
var meetupBlacklistGroups = failSafeRequire('./config/meetupBlacklistGroups.json')[0].groups;
var eventbriteBlacklistOrganiserIds = failSafeRequire('./config/eventbriteBlacklistOrganiserIds.json').ids;

module.exports = {
  location: city,
  city: city,
  country: country,
  symbol: locationSymbol,

  api_version: 'v1',
  apiUrl: 'https://webuild.sg/api/v1/',

  displayTimeformat: 'DD MMM YYYY, ddd, h:mm a',
  dateFormat: 'YYYY-MM-DD HH:mm Z',
  timezone: '+0800',
  timezoneInfo: 'Asia/Singapore',

  debug: process.env.NODE_ENV === 'development',

  calendarTitle: 'We Build SG Events',
  podcastApiUrl: 'http://webuildsg.github.io/live/api/v1/podcasts.json',
  domain: 'webuild.sg',

  archives: {
    githubRepoFolder: 'webuildsg/archives/',
    committer: {
      name: 'We Build SG Bot',
      email: 'webuildsg@gmail.com'
    }
  },

  ignoreWordsInDuplicateEvents: duplicateWords[0].words,

  auth0: {
    domain: 'webuildsg.auth0.com',
    clientId: process.env.WEBUILD_AUTH0_CLIENT_ID,
    clientSecret: process.env.WEBUILD_AUTH0_CLIENT_SECRET
  },

  facebookGroups : facebookGroups,
  blacklistEvents: blacklistEvents,
  whitelistEvents: whitelistEvents,
  icsGroups: icsGroups,

  githubParams: {
    version: '3.0.0',
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    location: process.env.LOCATION || city,
    maxUsers: process.env.MAX_USERS || 1000,
    maxRepos: process.env.MAX_REPOS || 50,
    starLimit: process.env.STAR_LIMIT || 50,
    outfile: __dirname + '/cache.json'
  },

  meetupParams: {
    key: process.env.MEETUP_API_KEY,
    country: locationSymbol,
    state: locationSymbol,
    city: city,
    category_id: 34, // Tech category
    page: 500,
    fields: 'next_event',

    blacklistGroups: meetupBlacklistGroups,
    blacklistWords: [
      'business',
      'UNICOM'
    ],
  },

  eventbriteParams: {
    token: process.env.EVENTBRITE_TOKEN,
    url: 'https://www.eventbriteapi.com/v3/events/search',
    categories: [
      '102',
      '119'
    ],
    blacklistOrganiserId: eventbriteBlacklistOrganiserIds
  }
};
