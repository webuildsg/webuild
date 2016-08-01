'use strict'

var moment = require('moment-timezone')

module.exports = function (config, podcastTime, testNow) {
  var now = testNow || moment()
  var dateFormat = config.dateFormat
  var livedate = moment(podcastTime, dateFormat)
  var then = moment(podcastTime, dateFormat)
  var ms = then.diff(now, 'milliseconds', true)
  var days = Math.floor(moment.duration(ms).asDays())
  var hours = 0
  var minutes = 0
  var seconds = 0
  var formattedTime = livedate.format('D MMM YYYY, ddd @h:mm a Z') + ' GMT'

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

  return {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    formattedTime: formattedTime
  }
}
