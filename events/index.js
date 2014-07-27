'use strict';

var moment = require('moment');
var utils = require('./utils');
var whitelistEvents = require('./whitelistEvents');
var blacklistEvents = require('./blacklistEvents');

var API = {
  getFacebookEvents: require('./facebookEvents').get,
  getMeetupEvents: require('./meetupEvents').get
}

function timeComparer(a, b) {
  return (moment(a.formatted_time, utils.timeformat).valueOf() -
          moment(b.formatted_time, utils.timeformat).valueOf());
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

function afterToday(evt) {
  return moment(evt.formatted_time, utils.timeformat) > moment()
}

exports.feed = [];
exports.update = function() {
  exports.feed = whitelistEvents.filter(afterToday);
  console.log('Updating the events feed...');
  addEvents('Meetup');
  addEvents('Facebook');
}

