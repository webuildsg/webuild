'use strict'

var moment = require('moment-timezone')

module.exports = function (checkdate, config, events) {
  checkdate = moment(checkdate, 'YYYY-MM-DD')

  var clashedEvents = {
    'meta': {
      'generated_at': new Date().toISOString(),
      'location': config.city,
      'api_version': config.api_version
    },
    'events': []
  }

  clashedEvents.events = events.filter(function (element) {
    if (moment(element.start_time).isSame(checkdate, 'day')) {
      return true
    }
  })

  clashedEvents.meta.total_events = clashedEvents.events.length

  return clashedEvents
}
