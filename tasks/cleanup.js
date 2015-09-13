'use strict';

var fs = require('fs');
var  moment = require('moment-timezone');

function getEventsToKeep(filepath) {
  filepath = filepath.substring(0, filepath.length - 5)
  var events = require(filepath);

  return events.filter(function(event) {
    if (!event.formatted_time) {
      return false;
    }
    return !moment(event.formatted_time, 'DD MMM YYYY, ddd, hh:mm a').isBefore(moment().subtract(1, 'day'))
  })
}

function writeEvents(filepath, eventsToKeep, callback) {
  if (eventsToKeep.length < 1) {
    console.log()
    eventsToKeep = require(process.cwd() + '/config/samplelistEvents')
  }

  fs.writeFile(filepath, JSON.stringify(eventsToKeep, null, 2), function(err) {
    if (err) {
      throw err;
    }
    var message = 'Successful in writing ' + eventsToKeep.length + ' events into ' + filepath;
    callback(message);
  });

}

function all(filepath, events, callback) {
  writeEvents(filepath, getEventsToKeep(filepath), function(message) {
    callback(message);
  })
}

exports.all = all;
exports.getEventsToKeep = getEventsToKeep;
exports.writeEvents = writeEvents;
