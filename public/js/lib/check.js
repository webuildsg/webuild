( function () {
  'use strict';

  // select all text in calendar URL
  var calURL = document.getElementById( 'selectAll' )

  if ( calURL ) {
    calURL.onclick = function () {
      this.setSelectionRange( 0, this.value.length )
    }
  }

  // event clash checker
  var eventDate = document.getElementById( 'check-event' );
  var ul = document.getElementById( 'clashed' );
  var eventsCheckApi = '/api/v1/check/';
  var loader = document.getElementById( 'loader' );

  if ( eventDate ) {
    eventDate.onchange = function () {
      var checkEvent = moment();
      var checkEventCompleteUrl = '';
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

      checkEventCompleteUrl = eventsCheckApi + checkEvent

      fetch( checkEventCompleteUrl ).then( function ( response ) {
        return response.json()
      } ).then( function ( body ) {
        var events = body.events

        displayClashStatus( events, wordedCheckDate )
        events.forEach( appendClashedEvent )
      } )
    }
  }

  window.addEventListener( 'hashchange', function () {
    updateDateCheck();
  } );

  if ( window.location.hash ) {
    updateDateCheck();
  }

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

})()
