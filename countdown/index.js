'use strict'

var request = require('request')
var moment = require('moment-timezone')
var config = require('../config')
var logger = require('../lib/logger')

function nextPodcastDateTime (callback) {
  var podcastApiUrl = config.podcastApiUrl
  request(podcastApiUrl, function (err, msg, response) {
    if (err) {
      logger.error(err)
    }
    var answer = JSON.parse(response).meta.next_live_show.start_time
    callback(answer)
  })
}

exports.update = function (done) {
  nextPodcastDateTime(function (response) {
    exports.liveDateResponse = response

    if (typeof done === 'function') {
      done()
    }
  })
}

exports.calculateCountdown = function (testNow) {
  var now = testNow || moment()
  var dateFormat = config.dateFormat
  var livedate = moment.tz(exports.liveDateResponse, dateFormat, config.timezoneInfo)
  var then = moment(exports.liveDateResponse, dateFormat)
  var ms = then.diff(now, 'milliseconds', true)
  var days = Math.floor(moment.duration(ms).asDays())
  var hours = 0
  var minutes = 0
  var seconds = 0

  if (days >= 0) {
    then.subtract(days, 'days')
    ms = then.diff(now, 'milliseconds', true)
    hours = Math.floor(moment.duration(ms).asHours())

    then.subtract(hours, 'hours')
    ms = then.diff(now, 'milliseconds', true)
    minutes = Math.floor(moment.duration(ms).asMinutes())

    then.subtract(minutes, 'minutes')
    ms = then.diff(now, 'milliseconds', true)
    seconds = Math.floor(moment.duration(ms).asSeconds())
  }

  exports.formattedTime = livedate.format('D MMM YYYY, ddd @h:mm a Z') + ' GMT'
  exports.days = days
  exports.hours = hours
  exports.minutes = minutes
  exports.seconds = seconds

  return
}
