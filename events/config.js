module.exports = {
  meetupParams: {
    key: process.env.MEETUP_API_KEY ||
      '496472523e5d5f6a6a3b6815126bf40',
    country: 'SG',
    category: 34,
    page: 500,
    next_event: true
  },

  blacklistGroups: [9319232],
  blacklistWords: ['business', 'networking']
};