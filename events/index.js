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
    function save(i, val) {
      arr[i] = val
      if (++numResolved === arr.length) {
        resolve(arr);
      }
    }

    arr.forEach(function(item, i) {
      item.then(function(val) {
        save(i, val);
      }).catch(function(err) {
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
    console.log('Fetched ' + data.results.length + ' rows');
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
    console.log('Fetched ' + events.length + ' events');
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
      name: row.name,
      group_name: fbGroups[grpIdx].name,
      url: 'https://www.facebook.com/events/' + row.id,
      formatted_time: moment(row.start_time).format(TIMEFORMAT)
    });
  });

  return eventsWithVenues;
}

function getFacebookEvents(user_access_token) {
  var base = 'https://graph.facebook.com/v2.0/'
  var groups = fbGroups.map(function(group) {
    return requestJson(base + group.id + '/events?' +
      querystring.stringify({
        since: moment().utc().zone('+0800').format('X'),
        access_token: user_access_token
      })
    );
  });

  return waitAllPromises(groups).then(function(groupsEvents) {
    console.log(groupsEvents.length + ' FB groups');
    var eventsWithVenues = [];
    groupsEvents.reduce(saveFacebookEvents, eventsWithVenues);
    console.log(eventsWithVenues.length + ' FB events with venues');
    return eventsWithVenues;
  })
}

function getFacebookUsers() {
  return new Promise(function (resolve, reject) {
    request.post('https://' + config.auth0.domain + '/oauth/token')
    .set('Content-Type', 'application/json')
    .send({
      'client_id': config.auth0.clientId,
      'client_secret': config.auth0.clientSecret,
      'grant_type': 'client_credentials'
    })
    .end(function(res) {
      if (res.status > 300) {
        console.error('Error getting Auth0 token:', res.status, err);
        reject(err);
      } else {
        request.get('https://' + config.auth0.domain + '/api/users')
        .set('Authorization', 'Bearer ' + res.body.access_token)
        .end(function(res) {
          if (res.status > 300) {
            console.error('Error getting Auth0 users ' + res.status, err);
            reject(err);
          } else {
            resolve(res.body || []);
          }
        })
      }
    });
  });
}

function getUsers() {
  getFacebookUsers().then(function(users) {
    users.forEach(function(user) {
      console.log(user.user_id)
      getFacebookEvents(user.identities[0].access_token)
      .then(function(data) {
        console.log('DATA:' + JSON.stringify(data) + data.length);
      });
    })
  }).catch(function(err) {
    console.error(err);
  })
}

module.exports = {
  getMeetupEvents: getMeetupEvents,
  getFacebookEvents: getFacebookEvents,
  timeFormat: TIMEFORMAT,
  getUsers: getUsers
}
