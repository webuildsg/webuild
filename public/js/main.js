(function() {
  'use strict';

  var podcastApi = '/api/podcasts',
    eventsCheckApi = '/api/check/',
    request = new XMLHttpRequest(),
    eventDate = document.getElementById('check'),
    ul = document.getElementById('clashed'),
    events = null,
    loader = document.getElementById('loader');

  // hello to another happy developer
  console.log('Hello fellow developer! :)');
  console.log('For suggestions:');
  console.log('- pull request at https://github.com/webuildsg/webuild');
  console.log('- tweet us @webuildsg');

  function getJSONProperty(response, property) {
    if (response.hasOwnProperty(property)){
      return response[property];
    } else {
      return JSON.parse(response)[property];
    }
  }

  function countdown(nextLiveShowDate) {
    var now = moment(),
      podcastDate = nextLiveShowDate,
      dateFormat = 'YYYY-MM-DD HH:mm Z',
      livedate = moment(podcastDate, dateFormat),
      displayLivedate = livedate.format('D MMM YYYY, ddd @h:mm a Z' ) + ' GMT',
      then = moment(podcastDate, dateFormat),
      ms = then.diff(now, 'milliseconds', true),
      days = Math.floor(moment.duration(ms).asDays()),
      hours = 0,
      minutes = 0,
      seconds = 0,
      diff = '',
      displayDays = '',
      displayHours = '',
      displayMinutes = '',
      displaySeconds = '';

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

      displayDays = 'in <strong>' + days + '</strong> days <strong>';
      displayHours = hours + '</strong> hours <strong>';
      displayMinutes = minutes + '</strong> minutes <strong>';
      displaySeconds = seconds + '</strong> seconds';

      diff =  displayDays + displayHours + displayMinutes + displaySeconds;

      document.getElementsByClassName('countdown')[0].innerHTML = diff;
      document.getElementById('livetime').innerHTML = displayLivedate;
    } else {
      document.getElementsByClassName('countdown')[0].innerHTML = '';
    }
  }

  function displayClashStatus(clashedEvents) {
    var newline = '<br>',
      displayNote = '<strong>Note:</strong> ',
      noteText = 'These events are free open events for developers, makers or designers only.',
      note = newline + displayNote + noteText,
      results = document.getElementById('results');

    loader.style.display = 'none';
    if (clashedEvents.length === 0) {
      results.innerHTML = 'No events are clashing!';
    } else if (clashedEvents.length === 1) {
      results.innerHTML = clashedEvents.length + ' event is clashing!' + note;
    } else {
      results.innerHTML = clashedEvents.length + ' events are clashing!' + note;
    }

    return;
  }

  function appendClashedEvent(thisEvent) {
    var li = document.createElement('li');
    li.innerHTML = [
      '<a href="',
      thisEvent.url,
      '"><p>',
      thisEvent.name,
      '<span>on ',
      thisEvent.formatted_time,
      '</span></p><p class="tagline">',
      'by ',
      thisEvent.group_name,
      '</p></a>'
    ].join('');
    ul.appendChild(li);
  }

  // event clash checker
  eventDate.onchange = function() {
    var checkEvent = moment(),
      checkEventCompleteUrl = '',
      request = new XMLHttpRequest();

    if (this.value.match(/\-/)) {
      // For Chrome
      checkEvent = this.value.substring(8, 10) + '-' + this.value.substring(5, 7) + '-' + this.value.substring(0, 4);
    } else {
      // For FF and Safari
      checkEvent = this.value.replace(/\//g, '-');
    }

    ul.innerHTML = '';
    loader.style.display = 'block';

    checkEventCompleteUrl = eventsCheckApi + checkEvent;
    request.open('GET', checkEventCompleteUrl, true);
    request.responseType = 'json';
    request.onload = function() {
      if (typeof request.response === 'string') {
        // Chrome
        events = JSON.parse(request.response);
        displayClashStatus(events);
      } else {
        // FF or Safari
        events = request.response;
        displayClashStatus(events);
      }
      events.forEach(appendClashedEvent);
    };
    request.send();
  }

  // read the next podcast date from /api/podcasts
  request.open('GET', podcastApi, true);
  request.responseType = 'json';
  request.onload = function() {
    countdown(getJSONProperty(request.response, 'next_live_show'));
    setInterval(function() {
      countdown(getJSONProperty(request.response, 'next_live_show'));
    }, 1000);
  }
  request.send();

})();
