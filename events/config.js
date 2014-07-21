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
  blacklistGroups: [9319232, 13903282],
  blacklistWords: ['business', 'networking'],
  meetupCommunities: ['Dribbble', 'Treehouse'],

  auth0: {
    domain: 'webuildsg.auth0.com',
    clientId: process.env.WEBUILD_AUTH0_CLIENT_ID,
    clientSecret: process.env.WEBUILD_AUTH0_CLIENT_SECRET,
  }
};
