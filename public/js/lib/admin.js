( function () {
  'use strict';

  // update on /admin
  var updateBtn = document.getElementById( 'update' )

  if ( updateBtn ) {
    updateBtn.addEventListener( 'click', function () {
      updateBtn.disabled = true

      var selectedGroups = document.querySelectorAll( 'input[type="radio"]:checked, input[type="checkbox"]:checked' )
      var answer = {}

      selectedGroups.forEach( function ( eachGroup ) {
        if ( eachGroup.value === 'yes' ) {
          if ( !answer.whitelistGroups ) {
            answer.whitelistGroups = []
          }

          answer.whitelistGroups.push( {
            group_id: parseInt( eachGroup.name ),
            group_name: eachGroup.dataset.name,
            group_url: eachGroup.dataset.url
          } )
        } else if ( eachGroup.value === 'no' ) {
          if ( !answer[ eachGroup.dataset.platform ] ) {
            answer[ eachGroup.dataset.platform ] = []
          }

          answer[ eachGroup.dataset.platform ].push( eachGroup.name )
        } else if ( eachGroup.value === 'blacklistEvent' ) {
          if ( !answer.blacklistEvents ) {
            answer.blacklistEvents = []
          }

          answer.blacklistEvents.push( {
            id: eachGroup.name,
            formatted_time: eachGroup.dataset.formmatedTime,
            url: eachGroup.dataset.url,
            name: eachGroup.dataset.name,
            group_name: eachGroup.dataset.groupName
          } )
        }
      } )

      fetch( '/admin', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify( answer ),
        credentials: 'same-origin'
      } ).then( function () {
        updateBtn.disabled = false
      } )
    } )
  }

  // add new event manually on /admin
  var addBtn = document.getElementById( 'add' )

  if ( addBtn ) {
    addBtn.addEventListener( 'click', function () {
      addBtn.disabled = true

      var addName = document.getElementById( 'add-name' ).value
      var addDescription = document.getElementById( 'add-description' ).value
      var addUrl = document.getElementById( 'add-url' ).value

      var addStartDate = document.getElementById( 'add-start-date' ).value
      var addStartTime = document.getElementById( 'add-start-time' ).value
      var addEndDate = document.getElementById( 'add-end-date' ).value
      var addEndTime = document.getElementById( 'add-end-time' ).value

      var addLocation = document.getElementById( 'add-location' ).value
      var addLatitude = document.getElementById( 'add-latitude' ).value
      var addLongitude = document.getElementById( 'add-longitude' ).value

      var addGroupName = document.getElementById( 'add-group-name' ).value
      var addGroupUrl = document.getElementById( 'add-group-url' ).value

      var answer = {
        name: addName,
        url: addUrl,
        description: addDescription,

        group_name: addGroupName,
        group_url: addGroupUrl,

        location: addLocation,
        start_time: {
          date: addStartDate,
          time: addStartTime
        },
        end_time: {
          date: addEndDate,
          time: addEndTime
        }
      }

      if ( addLatitude ) {
        answer.latitude = addLatitude
      }

      if ( addLongitude ) {
        answer.longitude = addLongitude
      }

      fetch( '/add', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify( answer ),
        credentials: 'same-origin'
      } ).then( function () {
        addBtn.disabled = false
      } )
    } )
  }
})()
