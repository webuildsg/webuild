var querystring = require('querystring');
var https = require('https');
var Promise = require('promise');
var moment = require('moment');
var config = require('./config');

var meetupQuery = querystring.stringify(config.meetupParams);

function https_get_json(url) {
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

function isValidGroup(row) {
  var blacklistGroups = config.blacklistGroups || [];
  var blacklistWords = config.blacklistWords || [];
  var blacklistRE = new RegExp(blacklistWords.join('|'), 'i');

  // Enforce country filter. Meetup adds JB groups into SG
  return blacklistWords.length === 0 ? true : !row.name.match(blacklistRE) &&
         !blacklistGroups.some(function(id) { return row.id === id })
         && row.country === (config.meetupParams.country || row.country);
}

function saveEvents(arr, row) {
  if (!(row.next_event && row.next_event.time)) return

  var entry = row.next_event;
  entry.group_name = row.name;
  entry.group_url = row.link;
  entry.url = 'http://meetup.com/' + row.urlname + '/events/' + entry.id;
  entry.formatted_time = moment(new Date(entry.time)).format('DD MMM, ddd, h:mm a');
  events.push(entry);
}

function getMeetupEvents() {
  return new Promise(function (resolve, reject) {
    https_get_json('https://www.meetup.com/muapi/find/groups?' + meetupQuery)
    .then(function(data) {
      events = [];
      data
        .filter(isValidGroup)
        .reduce(saveEvents, events);
      resolve(events);
    })
    .catch(function(err) {
      console.error(err);
      reject(err);
    })
  });
}

module.exports.getMeetupEvents = getMeetupEvents;

