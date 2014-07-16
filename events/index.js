var querystring = require('querystring');
var https = require('https');
var Promise = require('promise');
var moment = require('moment');
var request = require('superagent');
var fbGroups = require('./facebookGroups');
var config = require('./config');

var TIMEFORMAT = 'DD MMM, ddd, h:mm a';

function requestJson(url) {
  console.log('Getting data from ' + url);
  return new Promise(function (resolve, reject) {
    https.get(url, function (res) {
      var buffer = [];
      res.on('data', Array.prototype.push.bind(buffer));
      res.on('end', function () {
        var text = buffer.join('');
        var json = JSON.parse(text);
        if (res.statusCode < 400) {
          resolve(json);
        } else {
          console.error('Err! HTTP status code:', res.statusCode, url);
          reject(Error(text));
        }
      });
    }).on('error', function (err) {
      console.error('Err! HTTP request failed:', err.message, url);
      reject(err);
    });
  });
}

function waitAllPromises(arr) {
  if (arr.length === 0) return resolve([]);

  return new Promise(function (resolve, reject) {
    var numResolved = 0;
    var numErrors = 0;
    function save(i, val) {
      arr[i] = val
      if (numErrors === arr.length) {
        reject(arr[0].error);
      } else if (++numResolved === arr.length) {
        resolve(arr);
      }
    }

    arr.forEach(function(item, i) {
      item.then(function(val) {
        save(i, val);
      }).catch(function(err) {
        ++numErrors;
        save(i, {'error': err}); // resolve errors
      });
    });
  });
}

function isValidGroup(row) {
  var blacklistGroups = config.blacklistGroups || [];
  var blacklistWords = config.blacklistWords || [];
  var blacklistRE = new RegExp(blacklistWords.join('|'), 'i');

  // Enforce country filter. Meetup adds JB groups into SG
  return blacklistWords.length === 0 ? true : !row.name.match(blacklistRE) &&
         !blacklistGroups.some(function(id) { return row.id === id })
         && row.country === (config.meetupParams.country || row.country);
}

function saveMeetupEvents(arr, row) {
  if (!(row.next_event && row.next_event.time)) return

  var entry = row.next_event;
  entry.group_name = row.name;
  entry.group_url = row.link;
  entry.url = 'http://meetup.com/' + row.urlname + '/events/' + entry.id;
  entry.formatted_time = moment.utc(entry.time + entry.utc_offset).format(TIMEFORMAT);
  events.push(entry);
}

function getAllMeetupEvents() { //regardless of venue
  var url = 'https://api.meetup.com/2/groups?' +
    querystring.stringify(config.meetupParams);

  return requestJson(url).then(function(data) {
    console.log('Fetched ' + data.results.length + ' Meetup groups');
    events = [];
    data.results
      .filter(isValidGroup)
      .reduce(saveMeetupEvents, events);
    return events;
  }).catch(function(err) {
    console.error('Error getAllMeetupEvents():' + err);
  });
}

function getMeetupEvents() { //events with venues
  return getAllMeetupEvents().then(function(events) {
    console.log('Fetched ' + events.length + ' Meetup events');
    var venues = events.map(function(event) {
      return requestJson('https://api.meetup.com/2/event/'
        + event.id
        + '?fields=venue_visibility&key='
        + config.meetupParams.key);
    });

    return waitAllPromises(venues).then(function(venues) {
      var eventsWithVenues = events.filter(function(evt, i) {
        return venues[i].hasOwnProperty('venue') ||
          venues[i].venue_visibility === 'members';
      });
      console.log(eventsWithVenues.length + ' Meetup events with venues');
      return eventsWithVenues;
    }).catch(function(err) {
      console.error('Error getMeetupEvents(): ' + err);
    });
  });
}

function saveFacebookEvents(eventsWithVenues, row, grpIdx) {
  var thisGroupEvents = row.data || [];
  if (thisGroupEvents.length === 0) return eventsWithVenues;

  thisGroupEvents.forEach(function(row) {
    if (!row.location) return;
    eventsWithVenues.push({
      id: row.id,
      name: row.name,
      group_name: fbGroups[grpIdx].name,
      url: 'https://www.facebook.com/events/' + row.id,
      formatted_time: moment.utc(row.start_time).zone(row.start_time).format(TIMEFORMAT)
    });
  });

  return eventsWithVenues;
}

function getFacebookUserEvents(user_identity) {
  var base = 'https://graph.facebook.com/v2.0/'
  var groups = fbGroups.map(function(group) {
    return requestJson(base + group.id + '/events?' +
      querystring.stringify({
        since: moment().utc().zone('+0800').format('X'),
        access_token: user_identity.access_token
      })
    );
  });

  return new Promise(function (resolve, reject) {
    waitAllPromises(groups).then(function(groupsEvents) {
      console.log(groupsEvents.length + ' FB groups');
      var eventsWithVenues = [];
      groupsEvents.reduce(saveFacebookEvents, eventsWithVenues);
      console.log(eventsWithVenues.length + ' FB events with venues');
      resolve(eventsWithVenues);
    }).catch(function(err) {
      console.error('Error getting Facebook Events with: ' + JSON.stringify(user_identity));
      reject(err);
    });
  });
}

// Recursively try all available user access tokens (some may have expired)
//  until one is able to return facebook events.
//  We assume that all access tokens are able to access all white listed fb groups.
function getAllFacebookEvents(users) {
  if (users.length === 0) return users;

  user = users.pop();
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
    request.post('https://' + config.auth0.domain + '/oauth/token')
    .set('Content-Type', 'application/json')
    .send({
      'client_id': config.auth0.clientId,
      'client_secret': config.auth0.clientSecret,
      'grant_type': 'client_credentials'
    })
    .end(function(res) {
      if (res.status > 300) {
        console.error('Error getting Auth0 token:', res.status);
        reject(res.error);
      } else {
        console.log('Getting Auth0 users...')
        request.get('https://' + config.auth0.domain + '/api/users')
        .set('Authorization', 'Bearer ' + res.body.access_token)
        .end(function(res) {
          if (res.status > 300) {
            console.error('Error getting Auth0 users ' + res.status);
            reject(res.error);
          } else {
            resolve(res.body || []);
          }
        })
      }
    });
  });
}

function filterValidFacebookUsers(users) { //must have access to groups
  var base = 'https://graph.facebook.com/v2.0/me/groups?'
  var groupPromises = users.map(function(user) {
    return requestJson(base +
      querystring.stringify({
        access_token: user.identities[0].access_token
      })
    );
  });

  return waitAllPromises(groupPromises).then(function(userGroups) {
    console.log(userGroups.length + ' authorized users');
    var validusers = users.filter(function(user, idx) {
      return userGroups[idx].data.length > 0
    });
    console.log(validusers.length + ' users with accessible groups');
    return validusers;
  }).catch(function(err) {
    console.error('Error getting FB Groups with all user tokens');
  });
}

function getFacebookEvents() {
  return getFacebookUsers().then(function(allUsers) {
    return filterValidFacebookUsers(allUsers).then(function(users) {
      return getAllFacebookEvents(users);
    });
  }).catch(function(err) {
    console.error(err);
  })
}

module.exports = {
  getMeetupEvents: getMeetupEvents,
  getFacebookEvents: getFacebookEvents,
  timeFormat: TIMEFORMAT
}
