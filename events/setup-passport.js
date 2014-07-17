var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
var config = require('./config');

var strategy = new Auth0Strategy({
  domain: config.auth0.domain,
  clientID: config.auth0.clientId || '-',
  clientSecret: config.auth0.clientSecret || '-',
  callbackURL:  '/callback'
}, function(accessToken, refreshToken, profile, done) {
  console.log('Received Facebook profile from: ', profile.displayName);
  return done(null, profile);
});

passport.use(strategy);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

module.exports = passport;