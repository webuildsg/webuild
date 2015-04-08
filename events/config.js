module.exports = {
  meetupParams: {
    key: process.env.MEETUP_API_KEY,
    country: 'SG',
    state: 'SG',
    city: 'Singapore',
    category_id: 34, //Tech category
    page: 500,
    fields: 'next_event'
  },
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
    18312266
  ],
  blacklistWords: [
    'business',
    'networking',
    'UNICOM'
  ],
  auth0: {
    domain: 'webuildsg.auth0.com',
    clientId: process.env.WEBUILD_AUTH0_CLIENT_ID,
    clientSecret: process.env.WEBUILD_AUTH0_CLIENT_SECRET
  },
  eventbrite: {
    token: process.env.EVENTBRITE_TOKEN,
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
      8019329088
    ]
  }
};
