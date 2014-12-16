'use strict';

var expect = require('chai').expect,
  cleanup = require('../../events/cleanup');

describe('Remove past manual events', function() {
  var blacklistFile = 'test/fixtures/blacklistEvents.json',
    whitelistFile = 'test/fixtures/whitelistEvents.json';

  it.only('returns', function(done) {
    var eventsToKeep = [];

    cleanup(blacklistFile, function(reply) {
      reply.forEach(function(element) {
        // moment(element.formatted_time, 'DD MMM, WWW, hh:mm');
      })
      done();
    });

  })
})
