var querystring = require('querystring');
var Promise = require('promise');
var moment = require('moment');
var request = require('request');
var html_strip = require('htmlstrip-native');

var fbGroups = require('./facebookGroups');
var config = require('./config');
var whitelistEvents = require('./whitelistEvents');
var blacklistEvents = require('./blacklistEvents');

var TIMEFORMAT = 'DD MMM, ddd, h:mm a';

var htmlStripOptions = {
  include_script : false,
  include_style : false,
  compact_whitespace : true
};

function prequest(url, options) {
  options = options || {};
  options.url = url;
  options.json = true;
  console.log('Getting data from ' + url);
  return new Promise(function (resolve, reject) {
    request(options, function(err, resp, body) {
      if (err) return reject(err);

      if (resp.statusCode == 200) {
        resolve(body);
      } else {
        console.error('Err! HTTP status code:', resp.statusCode, url);
        reject(JSON.stringify(body));
      }
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

function saveMeetupEvents(eventsArr, row) {
  if (!(row.next_event && row.next_event.time)) return eventsArr;

  var entry = {};
  entry.name = row.next_event.name;
  entry.id = row.next_event.id;
  entry.group_name = row.name;
  entry.group_url = row.link;
  entry.description = html_strip.html_strip(row.description,htmlStripOptions);
  entry.url = 'http://meetup.com/' + row.urlname + '/events/' + row.next_event.id;
  entry.start_time = moment.utc(row.next_event.time).zone(row.next_event.utc_offset).toISOString();
  entry.formatted_time = moment.utc(row.next_event.time + row.next_event.utc_offset).format(TIMEFORMAT);
  eventsArr.push(entry);

  return eventsArr;
}

function getAllMeetupEvents() { //regardless of venue
  var url = 'https://api.meetup.com/2/groups?' +
    querystring.stringify(config.meetupParams);

  return prequest(url).then(function(data) {
    console.log('Fetched ' + data.results.length + ' Meetup groups');
    var events = [];
    data.results
      .filter(isValidGroup)
      .reduce(saveMeetupEvents, events);
    return events;
  }).catch(function(err) {
    console.error('Error getAllMeetupEvents(): ' + err);
  });
}

function getMeetupEvents() { //events with venues
  return getAllMeetupEvents().then(function(events) {
    console.log('Fetched ' + events.length + ' Meetup events');
    var venues = events.map(function(event) {
      return prequest('https://api.meetup.com/2/event/'
        + event.id
        + '?fields=venue_visibility&key='
        + config.meetupParams.key);
    });

    return waitAllPromises(venues).then(function(venues) {
      var eventsWithVenues = events.filter(function(evt, i) {
        if( venues[i].hasOwnProperty('venue') ||
          venues[i].venue_visibility === 'members'){
          if (venues[i].duration === undefined){
            venues[i].duration = 7200000
          }
          evt.end_time = moment.utc(evt.start_time).add('milliseconds',venues[i].duration).zone(evt.start_time).toISOString();
          return true;
        }

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
      description: row.description,
      group_name: fbGroups[grpIdx].name,
      url: 'https://www.facebook.com/events/' + row.id,
      start_time: moment.utc(row.start_time).zone(row.start_time),
      end_time: moment.utc(row.end_time).zone(row.start_time),
      formatted_time: moment.utc(row.start_time).zone(row.start_time).format(TIMEFORMAT)
    });
  });

  return eventsWithVenues;
}

function getFacebookUserEvents(user_identity) {
  var base = 'https://graph.facebook.com/v2.0/'
  var groups = fbGroups.map(function(group) {
    return prequest(base + group.id + '/events?' +
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
    prequest('https://' + config.auth0.domain + '/oauth/token', {
      method: 'POST',
      body: {
        'client_id': config.auth0.clientId,
        'client_secret': config.auth0.clientSecret,
        'grant_type': 'client_credentials'
      }
    }).then(function(data) {
      prequest('https://' + config.auth0.domain + '/api/users', {
        headers: {'Authorization': data.token_type + ' ' + data.access_token}
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
  var base = 'https://graph.facebook.com/v2.0/me/groups?'
  var groupPromises = users.map(function(user) {
    return prequest(base +
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
    console.error('getFacebookEvents(): ' + err);
  })
}

var API = {
  getFacebookEvents: getFacebookEvents,
  getMeetupEvents: getMeetupEvents
}

function timeComparer(a, b) {
  return (moment(a.formatted_time, TIMEFORMAT).valueOf() -
          moment(b.formatted_time, TIMEFORMAT).valueOf());
}

function addEvents(type) {
  API['get' + type + 'Events']().then(function(data) {
    data = data || [];
    var whiteEvents = data.filter(function(evt) { // filter black listed ids
      return blacklistEvents.some(function(blackEvent) {
        return blackEvent.id !== evt.id;
      });
    });
    exports.feed = exports.feed.concat(whiteEvents);
    exports.feed.sort(timeComparer);
    console.log(data.length + ' %s events added! %s total', type, exports.feed.length);
  }).catch(function(err) {
    console.error('Failed to add %s events: %s', type, err);
  });
}

exports.feed = [];
exports.update = function() {
  exports.feed = whitelistEvents;
  console.log('Updating the events feed...');
  addEvents('Meetup');
  addEvents('Facebook');
}

