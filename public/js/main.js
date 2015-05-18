( function () {
  'use strict';

  var podcastApi = '/api/v1/podcasts';
  var eventsCheckApi = '/api/v1/check/';
  var request = new XMLHttpRequest();
  var eventDate = document.getElementById( 'check' );
  var ul = document.getElementById( 'clashed' );
  var events = null;
  var loader = document.getElementById( 'loader' );
  var totalVideo = 0;
  var rand1toTotalVideo = 0;
  var newPlaylistAttribute = '';
  var buildEmoji = [
    '🚀',
    '🔌',
    '🔩',
    '📱',
    '💻',
    '✏️',
    '🚤',
    '🔨',
    '💡',
    '⛄',
    '🎈',
    '📡',
    '🎤'
  ];

  // title with emoji
  document.title = 'We Build ' + buildEmoji[ Math.floor( Math.random() * ( buildEmoji.length - 1 ) ) ];

  // hello to another happy developer
  console.log( '%cHello fellow developer! :)', 'background: #c11a18; color: #f1e9b4; font-size: 2em;' );
  console.log( '%cWe would love your suggestions!', 'background: #f1e9b4; color: #228dB7' );
  console.log( '%c- raise an issue at https://github.com/webuildsg/webuild/issues/new', 'background: #f1e9b4; color: #228dB7' );
  console.log( '%c- tweet us https://twitter.com/webuildsg', 'background: #f1e9b4; color: #228dB7' );

  // randomise video in youtube playlist
  totalVideo = 150; // larger than total videos in the playlist
  rand1toTotalVideo = Math.floor( Math.random() * totalVideo );
  newPlaylistAttribute = '//www.youtube.com/embed/videoseries?list=PLECEw2eFfW7hYMucZmsrryV_9nIc485P1&index=' + rand1toTotalVideo;
  document.getElementById( 'playlist' ).setAttribute( 'src', newPlaylistAttribute );

  // select all calendar URL
  document.getElementById( 'selectAll' ).onclick = function () {
    this.setSelectionRange( 0, this.value.length )
  }

  function countdown( nextLiveShowDate ) {
    var now = moment();
    var podcastDate = nextLiveShowDate;
    var dateFormat = 'YYYY-MM-DD HH:mm Z';
    var livedate = moment( podcastDate, dateFormat );
    var displayLivedate = livedate.format( 'D MMM YYYY, ddd @h:mm a Z' ) + ' GMT';
    var then = moment( podcastDate, dateFormat );
    var ms = then.diff( now, 'milliseconds', true );
    var days = Math.floor( moment.duration( ms ).asDays() );
    var hours = 0;
    var minutes = 0;
    var seconds = 0;
    var diff = '';
    var displayDays = '';
    var displayHours = '';
    var displayMinutes = '';
    var displaySeconds = '';

    if ( days >= 0 ) {
      then.subtract( days, 'days' );
      ms = then.diff( now, 'milliseconds', true );
      hours = Math.floor( moment.duration( ms ).asHours() );

      then.subtract( hours, 'hours' );
      ms = then.diff( now, 'milliseconds', true );
      minutes = Math.floor( moment.duration( ms ).asMinutes() );

      then.subtract( minutes, 'minutes' );
      ms = then.diff( now, 'milliseconds', true );
      seconds = Math.floor( moment.duration( ms ).asSeconds() );

      displayDays = 'in <strong>' + days + '</strong> days <strong>';
      displayHours = hours + '</strong> hours <strong>';
      displayMinutes = minutes + '</strong> minutes <strong>';
      displaySeconds = seconds + '</strong> seconds';

      diff = displayDays + displayHours + displayMinutes + displaySeconds;

      document.getElementsByClassName( 'countdown' )[ 0 ].innerHTML = diff;
      document.getElementById( 'livetime' ).innerHTML = displayLivedate;
    } else {
      document.getElementsByClassName( 'countdown' )[ 0 ].innerHTML = 'next episode is coming soon';
    }
  }

  function displayClashStatus( clashedEvents, wordedCheckDate ) {
    var newline = '<br>';
    var displayNote = '<strong>Note:</strong> ';
    var noteText = 'These events are free open events for developers, makers or designers only.';
    var note = newline + displayNote + noteText;
    var results = document.getElementById( 'results' );

    loader.style.display = 'none';
    if ( clashedEvents.length === 0 ) {
      results.innerHTML = 'There are no events on ' + wordedCheckDate + '!';
    } else if ( clashedEvents.length === 1 ) {
      results.innerHTML = 'There is ' + clashedEvents.length + ' event on ' + wordedCheckDate + '!' + note;
    } else {
      results.innerHTML = 'There are ' + clashedEvents.length + ' events on ' + wordedCheckDate + '!' + note;
    }

    return;
  }

  function appendClashedEvent( thisEvent ) {
    var li = document.createElement( 'li' );

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
    ].join( '' );
    ul.appendChild( li );
  }

  // responsive video playlist
  fluidvids.init( {
    selector: [ 'iframe' ], // runs querySelectorAll()
    players: [ 'www.youtube.com' ] // players to support
  } );

  // event clash checker
  eventDate.onchange = function () {
    var checkEvent = moment();
    var checkEventCompleteUrl = '';
    var request = new XMLHttpRequest();
    var wordedCheckDate = '';

    if ( this.value.match( /\-/ ) ) {
      // For Chrome: YYYY-MM-DD - unchanged
      checkEvent = this.value;
    } else {
      // For FF and Safari: DD/MM/YYYY to YYYY-MM-DD
      checkEvent = this.value.substring( 6, 10 ) + '-' + this.value.substring( 3, 5 ) + '-' + this.value.substring( 0, 2 );
    }

    wordedCheckDate = '<strong>' + moment( checkEvent, 'YYYY-MM-DD' ).format( 'D MMM YYYY, ddd' ) + '</strong>';

    ul.innerHTML = '';
    loader.style.display = 'block';

    checkEventCompleteUrl = eventsCheckApi + checkEvent;
    request.open( 'GET', checkEventCompleteUrl, true );
    request.responseType = 'json';
    request.onload = function () {
      if ( typeof request.response === 'string' ) {
        // Chrome
        events = JSON.parse( request.response ).events;
        displayClashStatus( events );
      } else {
        // FF or Safari
        events = request.response.events;
        displayClashStatus( events, wordedCheckDate );
      }
      events.forEach( appendClashedEvent );
    };
    request.send();
  }

  // read the next podcast date from /api/podcasts
  request.open( 'GET', podcastApi, true );
  request.responseType = 'json';
  request.onload = function () {
    var response = request.response;
    var podcastTimeString;

    if ( typeof request.response === 'string' ) {
      // Safari doesn't honor the responseType of 'json'.
      response = JSON.parse( request.response );
    }

    podcastTimeString = response.meta.next_live_show.start_time;
    countdown( podcastTimeString );
    setInterval( function () {
      countdown( podcastTimeString );
    }, 1000 );
  }
  request.send();

  function updateDateCheck() {
    var fragment = window.location.hash;
    var dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/; // match YYYY-MM-DD

    if ( fragment.indexOf( '#check' ) === 0 && fragment.length > 8 && fragment.substring( 6 ).match( dateRegex ) ) {
      var dateToCheck = fragment.substring( 6 );
      eventDate.value = dateToCheck;
      eventDate.onchange();
      eventDate.scrollIntoView( true );
    }
  }

  window.addEventListener( 'hashchange', function () {
    updateDateCheck();
  } );

  if ( window.location.hash ) {
    updateDateCheck();
  }
} )();
