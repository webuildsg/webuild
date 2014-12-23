'use strict';

var fs = require('fs'),
  moment = require('moment-timezone');

exports.getEventsToKeep = function(eventsFile) {
  var events = require(eventsFile);
  return events.filter(function(event) {
    if (!event.formatted_time) {
      return false;
    }
    return !moment(event.formatted_time, 'DD MMM, ddd, hh:mm a').isBefore(moment().subtract(1, 'day'))
  })
}

exports.writeEvents = function(filepath, eventsToKeep, callback) {
  fs.writeFile(filepath, JSON.stringify(eventsToKeep, null, 2), function(err) {
    if (err) {
      throw err;
    }

    var message = 'Successful in writing ' + eventsToKeep.length + ' events into ' + filepath;
    return callback(message);
  });
}
