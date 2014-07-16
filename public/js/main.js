(function () {
  var podcastApi = '/api/podcasts';

  // hello to another happy developer
  console.log('Hello fellow developer! :)');
  console.log('If you have suggestions for this site, get in touch at: https://github.com/webuildsg/webuild');

  // read the next podcast date from /api/podcasts
  var request = new XMLHttpRequest();
  request.open('GET', podcastApi, true);
  request.responseType = 'json';
  request.onload = function() {
    countdown(request.response.next_live_show);
    setInterval(function() {
      countdown(request.response.next_live_show);
    }, 1000);
  }
  request.send();

  // handles hash change event
  doHashChange(window.location.hash);
  $(window).bind('hashchange', function(){
    doHashChange(window.location.hash);
  });


  function doHashChange(hash){
    var $openlist = $('.open-list');
    if(hash){
      $openlist
        .find('.anchor[href="'+hash+'"]')
        .parent()
        .addClass('active')
        .siblings()
        .removeClass('active');
    } else {
      $openlist
        .find('li')
        .removeClass('active');
    }
  }

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

      document.getElementsByClassName('countdown')[0].innerHTML = diff;
      document.getElementById('livetime').innerHTML = livedate.format('D MMM YYYY, ddd @h:mm a Z' ) + ' GMT';
    } else {
      document.getElementsByClassName('countdown')[0].innerHTML = '';
    }
  }
})();
