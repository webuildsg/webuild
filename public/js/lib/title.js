( function () {
  'use strict';

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
})()
