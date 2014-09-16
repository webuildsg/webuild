module.exports = {
  debug: process.env.NODE_ENV === 'development',
  github: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    location: process.env.LOCATION || 'Singapore',
    maxUsers: process.env.MAX_USERS || 1000,
    maxRepos: process.env.MAX_REPOS || 50,
    starLimit: process.env.STAR_LIMIT || 50
  },
  outfile: __dirname + '/cache.json'
};
