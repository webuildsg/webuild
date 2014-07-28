'use strict';

var querystring = require('querystring'),
  Promise = require('promise'),
  moment = require('moment'),
  fbGroups = require('./facebookGroups'),
  utils = require('./utils'),
  config = require('./config');

function saveFacebookEvents(eventsWithVenues, row, grpIdx) {
  var thisGroupEvents = row.data || [];
  if (thisGroupEvents.length === 0) {
    return eventsWithVenues;
  }

  thisGroupEvents.forEach(function(row) {
    if (!row.location) {
      return;
    }
    eventsWithVenues.push({
      id: row.id,
      name: row.name,
      description: utils.htmlStrip(row.description),
      location: row.location,
      url: 'https://www.facebook.com/events/' + row.id,
      group_name: fbGroups[grpIdx].name,
      group_url: 'http://www.facebook.com/groups/' + fbGroups[grpIdx].id,
      formatted_time: moment.utc(row.start_time).zone(row.start_time).format(utils.timeformat),
      start_time: moment.utc(row.start_time).zone(row.start_time).toISOString(),
      end_time: moment.utc(row.end_time).zone(row.start_time).toISOString()
    });
  });

  return eventsWithVenues;
}

function getFacebookUserEvents(userIdentity) {
  var base = 'https://graph.facebook.com/v2.0/',
    groups;

  groups = fbGroups.map(function(group) {
    return utils.prequest(base + group.id + '/events?' +
      querystring.stringify({
        since: moment().utc().zone('+0800').format('X'),
        fields: 'description,name,end_time,location,timezone',
        access_token: userIdentity.access_token
      })
    );
  });

  return new Promise(function(resolve, reject) {
    utils.waitAllPromises(groups).then(function(groupsEvents) {
      console.log(groupsEvents.length + ' FB groups');
      var eventsWithVenues = [];
      groupsEvents.reduce(saveFacebookEvents, eventsWithVenues);
      console.log(eventsWithVenues.length + ' FB events with eventsData');
      resolve(eventsWithVenues);
    }).catch(function(err) {
      console.error('Error getting Facebook Events with: ' + JSON.stringify(userIdentity));
      reject(err);
    });
  });
}

// Recursively try all available user access tokens (some may have expired)
//  until one is able to return facebook events.
//  We assume that all access tokens are able to access all white listed fb groups.
function getAllFacebookEvents(users) {
  var user = users.pop();

  if (users.length === 0) {
    return users;
  }

  return getFacebookUserEvents(user.identities[0])
  .then(function(events) {
    return events;
  }).catch(function(err) {
    console.error(err);
    getAllFacebookEvents(users); // token failed. Try the next user's token
  })
}

// Get the FB user tokens from auth0
function getFacebookUsers() {
  return new Promise(function(resolve, reject) {
    utils.prequest('https://' + config.auth0.domain + '/oauth/token', {
      method: 'POST',
      body: {
        'client_id': config.auth0.clientId,
        'client_secret': config.auth0.clientSecret,
        'grant_type': 'client_credentials'
      }
    }).then(function(data) {
      utils.prequest('https://' + config.auth0.domain + '/api/users', {
        headers: {
          'Authorization': data.token_type + ' ' + data.access_token
        }
      }).then(function(data) {
        resolve(data || []);
      });
    }).catch(function(err) {
      console.error('Error getting Auth0 users');
      reject(err);
    })
  });
}

function filterValidFacebookUsers(users) { //must have access to groups
  var base = 'https://graph.facebook.com/v2.0/me/groups?',
    groupPromises;

  groupPromises = users.map(function(user) {
    return utils.prequest(base +
      querystring.stringify({
        access_token: user.identities[0].access_token
      })
    );
  });

  return utils.waitAllPromises(groupPromises).then(function(userGroups) {
    var validusers

    console.log(userGroups.length + ' authorized users');
    validusers = users.filter(function(user, idx) {
      return userGroups[idx].data.length > 0
    });
    console.log(validusers.length + ' users with accessible groups');
    return validusers;
  }).catch(function(err) {
    console.error('Error getting FB Groups with all user tokens: ' + err);
  });
}

function getFacebookEvents() {
  return getFacebookUsers().then(function(allUsers) {
    return filterValidFacebookUsers(allUsers).then(function(users) {
      return getAllFacebookEvents(users);
    });
  }).catch(function(err) {
    console.error('getFacebookEvents(): ' + err);
  })
}

exports.get = getFacebookEvents;
