'use strict';

var request = require('request'),
  moment = require('moment');

exports.update = function(done) {
  nextPodcastDateTime(function(response) {
    exports.liveDateResponse = response;

    if (typeof done === 'function') {
      done();
    }
  });
}

exports.calculateCountdown = function(testNow) {
  var now = testNow || moment(),
    dateFormat = 'YYYY-MM-DD HH:mm Z',
    livedate = moment(exports.liveDateResponse, dateFormat),
    then = moment(exports.liveDateResponse, dateFormat),
    ms = then.diff(now, 'milliseconds', true),
    days = Math.floor(moment.duration(ms).asDays()),
    hours = 0,
    minutes = 0,
    seconds = 0;

  if (days >= 0) {
    then.subtract(days, 'days');
    ms = then.diff(now, 'milliseconds', true);
    hours = Math.floor(moment.duration(ms).asHours());

    then.subtract(hours, 'hours');
    ms = then.diff(now, 'milliseconds', true);
    minutes = Math.floor(moment.duration(ms).asMinutes());

    then.subtract(minutes, 'minutes');
    ms = then.diff(now, 'milliseconds', true);
    seconds = Math.floor(moment.duration(ms).asSeconds());
  }

  exports.formattedTime =  livedate.format('D MMM YYYY, ddd @h:mm a Z' ) + ' GMT';
  exports.days = days;
  exports.hours = hours;
  exports.minutes = minutes;
  exports.seconds = seconds;

  return;
}

function nextPodcastDateTime(callback) {
  var podcastApiUrl = 'http://webuildsg.github.io/live/api/v1/podcasts.json';
  request(podcastApiUrl, function(err, msg, response) {
    var answer = JSON.parse(response).meta.next_live_show.start_time;
    callback(answer);
  })
}
