( function () {
  'use strict';

  // randomise video in youtube playlist
  var totalVideo = 0;
  var rand1toTotalVideo = 0;
  var newPlaylistAttribute = '';
  var playlistVideo = document.getElementById( 'playlist' )

  if ( playlistVideo ) {
    totalVideo = 150; // larger than total videos in the playlist
    rand1toTotalVideo = Math.floor( Math.random() * totalVideo );
    newPlaylistAttribute = '//www.youtube.com/embed/videoseries?list=PLECEw2eFfW7hYMucZmsrryV_9nIc485P1&index=' + rand1toTotalVideo;
    playlistVideo.setAttribute( 'src', newPlaylistAttribute );
  }

  // responsive video playlist
  fluidvids.init( {
    selector: [ 'iframe' ], // runs querySelectorAll()
    players: [ 'www.youtube.com' ] // players to support
  } );
})()
