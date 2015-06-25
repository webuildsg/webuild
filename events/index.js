'use strict';

var config = require('../config');
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
    ignoreNumber: true,
    common: [
      'singapore',

      'meetup',
      'group',
      'event',

      'centre', 'center', 'tower', 'road',
      'avenue', 'ave',
      'building', 'city',
      'jalan', 'jln',
      'lane', 'ln',
      'street', 'st',
      'plaza',
      'town',
      'new',
      'level', 'floor',

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
      '-',

      'topic', 'server', 'create', 'talk', 'session', 'workshop', 'tell', 'share', 'coding', 'venue', 'speaker', 'about',

      'a', 'i', 'will', 'be', 'who', 'want', 'or', 'have', 'if', 'go'
    ],
    depluralize: true
  };

  var overlappedEventName = overlap(event1.name, event2.name, options);
  var overlappedEventLocation = overlap(event1.location, event2.location, options);
  var overlappedEventDescription = overlap(event1.description, event2.description, options);

  if ((event1.formatted_time === event2.formatted_time) &&
      (overlappedEventLocation.length > 0)) {
    if (overlappedEventName.length > 0 || overlappedEventDescription.length > 2) {
      console.log(clc.magenta('Info: Duplicate event removed [' + overlappedEventDescription.length + ']: ' + event1.url));
      return true;
    }
  }

  return false;
}

function afterToday(evt) {
  return moment(evt.formatted_time, utils.timeformat) > moment();
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
    exports.feed.events = exports.feed.events.filter(afterToday);
    exports.feed.events.sort(timeComparer);
    exports.feed.events = removeDuplicates(exports.feed.events);
    console.log(clc.green('Success: Added ' + whiteEvents.length + ' ' + type + ' events'));
    exports.feed.meta.total_events = exports.feed.events.length;
  }).catch(function(err) {
    console.error(clc.red('Error: Failed to add %s events: %s'), type, err.statusCode || err);
  });
}

exports.feed = [];
exports.removeDuplicates = removeDuplicates;
exports.update = function() {
  exports.feed = {
    'meta': {
      'generated_at': new Date().toISOString(),
      'location': config.city,
      'api_version': config.api_version
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
