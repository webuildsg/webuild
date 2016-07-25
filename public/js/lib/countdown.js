( function () {
  'use strict';

  // read the next podcast date from /api/podcasts
  if (window.location.pathname !== '/') {
    return
  }

  var podcastApi = '/api/v1/podcasts';
  fetch( podcastApi ).then( function ( response ) {
    return response.json()
  } ).then( function ( body ) {
    var podcastTimeString;

    if ( body.meta.next_live_show ) {
      podcastTimeString = body.meta.next_live_show.start_time;

      countdown( podcastTimeString );
      setInterval( function () {
        countdown( podcastTimeString );
      }, 1000 );
    }
  } )

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
})()
