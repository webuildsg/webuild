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
var blacklistEvents = failSafeRequire('./config/blacklistEvents.json')
var icsGroups = failSafeRequire('./config/icsGroups.json');
var whitelistEvents = failSafeRequire('./config/whitelistEvents.json');

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
    githubRepoFolder: 'webuildsg/archives/contents/',
    committer: {
      name: 'We Build SG Bot',
      email: 'webuildsg@gmail.com'
    }
  },

  ignoreWordsInDuplicateEvents: [
    'meetup', 'group', 'event',

    'centre', 'center', 'tower', 'road',
    'avenue', 'ave',
    'building', 'city',
    'jalan', 'jln',
    'lane', 'ln',
    'street', 'st',
    'plaza', 'town', 'new',
    'level', 'floor',

    'first',
    'second',
    'third',

    'jan', 'january',
    'feb', 'february',
    'mar', 'march',
    'apr', 'april',
    'may',
    'jun', 'june',
    'jul', 'july',
    'aug', 'august',
    'sep', 'sept', 'september',
    'oct', 'october',
    'nov', 'november',
    'dec', 'december',
    '-',

    'mon', 'monday',
    'tue', 'tues', 'tuesday',
    'wed', 'wednesday',
    'thu', 'thurs', 'thursday',
    'fri', 'friday',
    'sat', 'saturday',
    'sun', 'sunday',

    'topic', 'create', 'talk', 'session', 'workshop', 'tell', 'share', 'coding', 'venue', 'about',

    'speaker', 'memeber',

    'a', 'i', 'will', 'be', 'who', 'want', 'or', 'have', 'if', 'go', 'of', 'with', 'from', 'for',

    'the', 'others', 'another', 'all',

    'your', 'you', 'our', 'you\'re', 'we\'re'
  ],

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

    blacklistGroups: [
      9319232,
      13903282,
      15867652,
      15237742,
      10989282,
      13917282,
      12117622,
      17604562,
      4280832,
      14995732,
      15750332,
      18312857,
      18446496,
      18429432,
      18312607,
      18312266,
      18543965,
      18536657,
      18553183,
      16869012,
      18180754,
      18567644,
      18695668
    ],
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
    blacklistOrganiserId: [
      4456586249,
      7875748007,
      7872992855,
      7606683649,
      7554720435,
      7598389997,
      7877801280,
      2263972645,
      7637890579,
      7356770417,
      4435944763,
      7174588005,
      6692116179,
      7486804327,
      7926982153,
      7895391556,
      3604803215,
      8017855847,
      8039668474,
      8031646712,
      7981933136,
      8019329088,
      8036387668,
      1132869965,
      8129344845,
      8122789275,
      8127085137,
      5439297409,
      8133260061,
      8158476348,
      8173408144,
      1118363123,
      6693763631,
      8190696320,
      8180937483,
      4554446509,
      8176022316,
      8139261781,
      8118140963
    ]
  }
};
