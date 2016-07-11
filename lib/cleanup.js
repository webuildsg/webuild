'use strict'

var logger = require('./logger')
var clc = require('cli-color')
var moment = require('moment-timezone')
var db = require('../lib/database')

function isInPast (event) {
  return !moment(event.formatted_time, 'DD MMM YYYY, ddd, hh:mm a').isBefore(moment().subtract(1, 'day'))
}

function removeEventsInPast (eventList, eventType) {
  var eventsToKeep = {}
  var eventName

  for (var eachEvent in eventList) {
    if (eachEvent !== 'sample' && isInPast(eachEvent)) {
      eventName = eventType + '/' + eachEvent

      logger.trace(clc.green(eventName + ' is removed from Firebase DB'))
      db.child(eventName).remove()
    }
  }

  return eventsToKeep
}

module.exports = function (dbData, callback) {
  [ 'whitelistEvents', 'blacklistEvents' ].forEach(function (eachType) {
    removeEventsInPast(dbData[ eachType ], eachType)
  })

  var message = 'Cleaning up past blacklistEvents and whitelistEvents.'

  logger.trace(clc.green(message))
  callback(null, message)
}
