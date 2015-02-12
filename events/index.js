'use strict';

var moment = require('moment-timezone');
var utils = require('./utils');
var whitelistEvents = require('./whitelistEvents');
var blacklistEvents = require('./blacklistEvents');
var overlap = require('word-overlap');
var clc = require('cli-color');
var API = {
  getFacebookEvents: require('./facebookEvents').get,
  getMeetupEvents: require('./meetupEvents').get,
  getEventbriteEvents: require('./eventbriteEvents').get,
  getIcsEvents: require('./icsEvents').get
};
var clc = require('cli-color');

function isDuplicateEvent(event1, event2) {
  var options = {
    ignoreCase: true,
    ignoreCommonWords: true,
    common: [
      'singapore',

      'meetup',
      'group',
      'event',

      'centre',
      'center',
      'tower',

      'first',
      'second',
      'third',

      'jan', 'january',
      'feb', 'february',
      'mar', 'march',
      'apr', 'april',
      'may',
      'jun', 'june',
      'jul', 'july',
      'aug', 'august',
      'sep', 'sept', 'september',
      'oct', 'october',
      'nov', 'november',
      'dec', 'december',
      '-'
    ],
    depluralize: true
  };
  var event1Compare = event1.name + ' at ' + event1.location;
  var event2Compare = event2.name + ' at ' + event2.location;
  var overlappedWords = overlap(event1Compare, event2Compare, options);

  var reply = event1.formatted_time === event2.formatted_time && overlappedWords.length > 0;

  if (reply) {
    console.log('Info: Found duplicate events:');
    console.log('Info: [Event A] ' + event1.url);
    console.log('Info: [Event B] ' + event2.url);
    console.log('Info: Overlapped words (' + overlappedWords.length + ') ' + overlappedWords);
  }

  return reply;

}

function removeDuplicates(feed) {
  var uniqueEvents = [];
  var isDuplicate;

  feed.forEach(function(thisEvent) {
    isDuplicate = uniqueEvents.some(function(thatEvent) {
      return isDuplicateEvent(thisEvent, thatEvent);
    })

    if (!isDuplicate) {
      uniqueEvents.push(thisEvent);
    } else {
      console.log('Info: Removing ' + thisEvent.url);
    }
  })

  return uniqueEvents;
}

function timeComparer(a, b) {
  return (moment(a.start_time).valueOf() -
          moment(b.start_time).valueOf());
}

function addEvents(type) {
  API[ 'get' + type + 'Events' ]().then(function(data) {
    data = data || [];
    var whiteEvents = data.filter(function(evt) { // filter black listed ids
      return !blacklistEvents.some(function(blackEvent) {
        return blackEvent.id === evt.id;
      });
    });
    exports.feed.events = exports.feed.events.concat(whiteEvents);
    exports.feed.events.sort(timeComparer);
    exports.feed.events = removeDuplicates(exports.feed.events);
    console.log(clc.green('Success: Added ' + whiteEvents.length + ' ' + type + ' events'));
    exports.feed.meta.total_events = exports.feed.events.length;
  }).catch(function(err) {
    console.error(clc.red('Error: Failed to add %s events: %s'), type, err.statusCode || err);
  });
}

function afterToday(evt) {
  return moment(evt.formatted_time, utils.timeformat) > moment();
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
  console.log('Info: Updating the events feed... this may take a while');
  addEvents('Meetup');
  addEvents('Facebook');
  addEvents('Eventbrite');
  addEvents('Ics');
}
