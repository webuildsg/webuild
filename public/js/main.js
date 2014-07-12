require(
  [
  'jQuery',
  'Moment'
  ],
  function($, Moment) {

  // hello to another happy developer
  console.log('hello fellow developer :)');
  console.log('if you have suggestions for this site, do buzz me and say hi @sayanee_');

  // click live section to go to the live website
  $('.live').click(function() {
    window.parent.location.href = 'http://live.webuild.sg';
  });

  // countdown
  countdown();
  setInterval(countdown, 1000);
  function countdown () {
    var now = moment(),
    podcastDate = "2014-08-02 11:00 +0800",
    dateFormat = "YYYY-MM-DD HH:mm Z",
    livedate = moment(podcastDate, dateFormat),
    then = moment(podcastDate, dateFormat);

    ms = then.diff(now, 'milliseconds', true);
    days = Math.floor(moment.duration(ms).asDays());

    if (days >= 0) {
      then.subtract('days', days);
      ms = then.diff(now, 'milliseconds', true);
      hours = Math.floor(moment.duration(ms).asHours());

      then.subtract('hours', hours);
      ms = then.diff(now, 'milliseconds', true);
      minutes = Math.floor(moment.duration(ms).asMinutes());

      then.subtract('minutes', minutes);
      ms = then.diff(now, 'milliseconds', true);
      seconds = Math.floor(moment.duration(ms).asSeconds());

      diff = 'in <strong>' + days + '</strong> days <strong>' + hours + '</strong> hours <strong>' + minutes + '</strong> minutes <strong>' + seconds + '</strong> seconds';

      $('.countdown').html(diff);
      $('#livetime').html( livedate.format('D MMM YYYY, ddd @h:mm a Z' ) + ' GMT' );
    } else {
      $('.countdown').html('');
    }
  }
});
