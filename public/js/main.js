require(
  [
  'jQuery',
  'Moment'
  ],
  function($, Moment) {

  var podcastSite = 'http://live.webuild.sg';
  var podcastSiteApi = podcastSite + '/api/podcasts.json';

  // hello to another happy developer
  console.log('Hello fellow developer! :)');
  console.log('If you have suggestions for this site, get in touch at: https://github.com/webuildsg/webuild');

  // click live section to go to the live website
  $('.live').click(function() {
    window.parent.location.href = podcastSite;
  });

  var request = new XMLHttpRequest();
  request.open('GET', podcastSiteApi, true);
  request.responseType = 'json';
  request.onload = function() {
    countdown(request.response.next_live_show);
    console.log(request.response.next_live_show);
    setInterval(function() {
      countdown(request.response.next_live_show);
    }, 1000);
  }
  request.send();

  function countdown(nextLiveShowDate) {
    var now = moment(),
    podcastDate = nextLiveShowDate,
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
