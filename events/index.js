'use strict';

var moment = require('moment'),
  utils = require('./utils'),
  whitelistEvents = require('./whitelistEvents'),
  blacklistEvents = require('./blacklistEvents'),
  API = {
    getFacebookEvents: require('./facebookEvents').get,
    getMeetupEvents: require('./meetupEvents').get
  };

function removeDuplicates(feed) {
  var prev, cur, i;
  for (i = 1; i < feed.length; i++) {
    prev = feed[i - 1];
    cur = feed[i];
    if (prev.formatted_time === cur.formatted_time && prev.name === cur.name) {
      feed.splice(i, 1);
    }
  }
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
    exports.feed = exports.feed.concat(whiteEvents);
    exports.feed.sort(timeComparer);
    removeDuplicates(exports.feed);
    console.log(whiteEvents.length + ' %s events added! %s total', type, exports.feed.length);
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
