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

  blacklistGroups: [9319232],
  blacklistWords: ['business', 'networking'],

  outfile: 'events.json'
};