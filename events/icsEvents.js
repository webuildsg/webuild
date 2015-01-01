'use strict';

var icsGroups = require('./icsGroups');
var WBEvent = require('./WBEvent');
var ical = require('ical');
var getUrl = require('get-urls');
var utils = require('./utils');
var Promise = require('promise');
var moment = require('moment-timezone');

function trimAfterAt(uid) {
  var trimAfterAtRegex = /(\w*)@.*/;
  return uid.match(trimAfterAtRegex)[1];
}

function getUrlfromDescriptionOrGroupUrl(eventToCheck) {
  if (eventToCheck.url && eventToCheck.url.length > 1) {
    return eventToCheck.url;
  } else if (!eventToCheck.description || eventToCheck.description.length < 1) {
    return eventToCheck.group_url;
  } else if (getUrl(eventToCheck.description)[0]) {
    return getUrl(eventToCheck.description)[0];
  } else {
    return eventToCheck.group_url;
  }
}

function hasLocation(eventToCheck) {
  if (eventToCheck.location.indexOf('Singapore') >= 0) {
    return true;
  } else if (eventToCheck.location.indexOf('singapore') >= 0) {
    return true;
  } else if (eventToCheck.group_name === 'SG Hack & Tell') {
    return eventToCheck.location += ', Singapore';
  } else {
    return false;
  }
}

function isInFuture(eventToCheck) {
  return moment(eventToCheck.start_time).isAfter(moment());
}

function getAllIcsGroups(callback) {
  var events = [];
  var countReplies = 0;

  icsGroups.forEach(function(group) {
    ical.fromURL(group.ics_url, {}, function(err, data) {
      if (err) {
        console.log('Error: Reading ICS Group from ' + group.group_name + ': ' + err);
      }

      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          data[key].group_name = group.group_name;
          data[key].group_url = group.group_url;
          data[key].start_time = data[key].start;
          data[key].end_time = data[key].end;
          events.push(data[key]);
        }
      }
      countReplies++;

      if (countReplies >= icsGroups.length) {
        callback(events)
      }
    });
  })
}

function getIcsEvents() {
  var normEvents;

  return new Promise(function(resolve) {
    getAllIcsGroups(function(events) {
      normEvents = events.map(function(ev) {
        var wbEvent = new WBEvent();

        wbEvent.id = trimAfterAt(ev.uid);
        wbEvent.name = ev.summary;
        wbEvent.description = ev.description;
        wbEvent.location = ev.location;
        wbEvent.url = getUrlfromDescriptionOrGroupUrl(ev);
        wbEvent.group_name = ev.group_name;
        wbEvent.group_url = ev.group_url;
        wbEvent.formatted_time = utils.formatLocalTime(ev.formatted_time);
        wbEvent.start_time = utils.localTime(ev.start_time).toISOString();
        wbEvent.end_time = utils.localTime(ev.end_time).toISOString();

        return wbEvent;
      })

      normEvents = normEvents.filter(hasLocation);
      console.log('Info: Found ' + normEvents.length + ' ics events in total');
      normEvents = normEvents.filter(isInFuture);
      console.log('Info: Found ' + normEvents.length + ' ics future events in SG with location');

      resolve(normEvents);
    })
  })

}

exports.getAllIcsGroups = getAllIcsGroups;
exports.get = getIcsEvents;

exports.trimAfterAt = trimAfterAt;
exports.getUrlfromDescriptionOrGroupUrl = getUrlfromDescriptionOrGroupUrl;
exports.hasLocation = hasLocation;
exports.isInFuture = isInFuture;
