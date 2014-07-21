(function () {
  var podcastApi = '/api/podcasts';
  var eventsApi = '/api/events';

  // hello to another happy developer
  console.log('Hello fellow developer! :)');
  console.log('If you have suggestions for this site, get in touch at: https://github.com/webuildsg/webuild');

  // read the next podcast date from /api/podcasts
  var request = new XMLHttpRequest();
  request.open('GET', podcastApi, true);
  request.responseType = 'json';
  request.onload = function() {
    countdown(getJSONProperty(request.response,"next_live_show"));
    setInterval(function() {
      countdown(getJSONProperty(request.response,"next_live_show"));
    }, 1000);
  }
  request.send();

  function getJSONProperty(response, property){
    if (response.hasOwnProperty(property)){
      return response[property];
    }else{
      return JSON.parse(response)[property];
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

  // event clash checker
  var eventDate = document.getElementById('check');
  var ul = document.getElementById('clashed');
  var events = null;

  eventDate.onchange = function() {

    var clashingEvents = [];
    var checkEvent = moment();
    if (this.value.match(/\-/)){
      checkEvent = moment(this.value, "YYYY-MM-DD");
    }else{
      // For FF and Safari support
      checkEvent = moment(this.value, "DD/MM/YYYY");
    }

    ul.innerHTML = '';

    if(events === null) {
      var request = new XMLHttpRequest();
      request.open('GET', eventsApi, true);
      request.responseType = 'json';
      request.onload = function() {
        if (typeof request.response === 'string'){
          events = JSON.parse(request.response);
        }else{
          events = request.response;
        }
        checkEventClashes(events, checkEvent).forEach(appendClashedEvent);
      };
      request.send();
    } else {
      checkEventClashes(events, checkEvent).forEach(appendClashedEvent);
    }
  }

  function checkEventClashes(events, checkEvent){
    var note = '<br><strong>Note:</strong> The following are from the list of free, open events for developers, makers or designers only.'
    var clashedEvents = events.filter(function(element) {
      if(moment(element.start_time).isSame(checkEvent,'day') ) {
        return true;
      }
    });

    if(clashedEvents.length === 0) {
      document.getElementById('results').innerHTML = 'No events are clashing!';
    } else if(clashedEvents.length === 1){
      document.getElementById('results').innerHTML = clashedEvents.length + ' event is clashing!' + note;
    } else {
      document.getElementById('results').innerHTML = clashedEvents.length + ' events are clashing!' + note;
    }

    return clashedEvents;
  }

  function appendClashedEvent(thisEvent){
    var li = document.createElement('li');
    li.innerHTML = '<a href="'
      + thisEvent.url
      + '"><p>'
      + thisEvent.name
      + '<span>on '
      + thisEvent.formatted_time
      + '</span></p><p class="tagline">'
      + 'by '
      + thisEvent.group_name
      + '</p></a>';
    ul.appendChild(li);
  }

})();
