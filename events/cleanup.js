'use strict';

var fs = require('fs'),
  moment = require('moment-timezone');

exports.readEvents = function(filepath, callback) {
  fs.readFile(filepath, 'utf8', function(err, data) {
    if (err) {
      return console.log('Error in reading file: ' + err);
    }
    return callback(JSON.parse(data));
  });
}

exports.getEventsToKeep = function(events) {
  var eventsToKeep = [];

  events.forEach(function(event) {
    if (!moment(event.formatted_time, 'DD MMM, ddd, hh:mm a').isBefore(moment().subtract(1, 'day'))) {
      eventsToKeep.push(event);
    }
  })

  return eventsToKeep;
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
