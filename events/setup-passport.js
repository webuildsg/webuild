'use strict';

var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
var config = require('./config');
var strategy;

strategy = new Auth0Strategy({
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

passport.callback = function(req, res, next) {
  passport.authenticate('auth0', function(err, user) {
    if (err) {
      console.log('Auth0 Error:' + err)
      return next(err); // will generate a 500 error
    } else if (!user) {
      console.log('Unknown user logging with FB');
      return res.redirect('/admin?error=1');
    }
    return res.redirect('/admin?user=' + user.displayName);
  })(req, res, next);
}

module.exports = passport;
