'use strict';

var moment = require('moment-timezone');
var utils = require('./utils');
var whitelistEvents = require('./whitelistEvents');
var blacklistEvents = require('./blacklistEvents');
var overlap = require('word-overlap');
var API = {
  getFacebookEvents: require('./facebookEvents').get,
  getMeetupEvents: require('./meetupEvents').get,
  getEventbriteEvents: require('./eventbriteEvents').get,
  getIcsEvents: require('./icsEvents').get
};

function removeDuplicates(feed) {
  var prev;
  var cur;
  var prevEvent;
  var curEvent;
  var i;
  var options = {
    ignoreCase: true,
    ignoreCommonWords: true,
    common: [ 'singapore', 'meetup' ],
    depluralize: true
  }
  var indexToRemove = [];

  for (i = 1; i < feed.length; i++) {
    prev = feed[i - 1];
    prevEvent = prev.name + ' at ' + prev.location + ' by ' + prev.group_name;
    cur = feed[i];
    curEvent = cur.name + ' at ' + cur.location + ' by ' + cur.group_name;

    if (prev.formatted_time === cur.formatted_time) {
      if (overlap(prevEvent, curEvent, options).length > 0) {
        indexToRemove.push(i);
      }
    }
  }

  indexToRemove.forEach(function(element) {
    feed.splice(element - 1, 1);
  })

  return feed;
}

function timeComparer(a, b) {
  return (moment(a.start_time).valueOf() -
          moment(b.start_time).valueOf());
}

function addEvents(type) {
  API['get' + type + 'Events']().then(function(data) {
    data = data || [];
    var whiteEvents = data.filter(function(evt) { // filter black listed ids
      return !blacklistEvents.some(function(blackEvent) {
        return blackEvent.id === evt.id;
      });
    });
    exports.feed.events = exports.feed.events.concat(whiteEvents);
    exports.feed.events.sort(timeComparer);
    removeDuplicates(exports.feed.events);
    console.log(whiteEvents.length + ' %s events added! %s total', type, exports.feed.events.length);
    exports.feed.meta.total_events = exports.feed.events.length;
  }).catch(function(err) {
    console.error('Failed to add %s events: %s', type, err.statusCode || err);
  });
}

function afterToday(evt) {
  return moment(evt.formatted_time, utils.timeformat) > moment()
}

exports.feed = [];
exports.removeDuplicates = removeDuplicates;
exports.update = function() {
  exports.feed = {
    'meta': {
      'generated_at': new Date().toISOString(),
      'location': 'Singapore',
      'api_version': 'v1'
    },
    'events': {}
  };
  exports.feed.events = whitelistEvents.filter(afterToday);
  console.log('Updating the events feed...');
  addEvents('Meetup');
  addEvents('Facebook');
  addEvents('Eventbrite');
  addEvents('Ics');
}
