module.exports = {
  meetupParams: {
    key: process.env.MEETUP_API_KEY,
    country: 'SG',
    category: 34,
    page: 500,
    next_event: true
  },

  blacklistGroups: [9319232],
  blacklistWords: ['business', 'networking']
};