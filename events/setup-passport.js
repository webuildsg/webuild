var passport = require('passport');
var Auth0Strategy = require('passport-auth0');

var strategy = new Auth0Strategy({
    domain:       'alyssa.auth0.com',
    clientID:     'uMk0LXpEmYxae6OEcWsCJme2f5IsorK0',
    clientSecret: 'rVMO-cX41_qVVjFyXPph0LUHe6jngiNfFJLZWJLhsw8AWim1waSPWB1zg7U4oveJ',
    callbackURL:  '/callback'
  }, function(accessToken, refreshToken, profile, done) {
    //Some tracing info
    console.log('profile is', profile);
    return done(null, profile);
  });

passport.use(strategy);

// This is not a best practice, but we want to keep things simple for now
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = strategy;