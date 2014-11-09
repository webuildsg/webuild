'use strict';

var expect = require('chai').expect,
  cleanup = require('../../events/cleanup');

describe('Remove past manual events', function() {
  var blacklistFile = '/Users/sayanee/Workspace/webuild/test/fixtures/blacklistEvents.json',
    whitelistFile = '/Users/sayanee/Workspace/webuild/test/fixtures/whitelistEvents.json';

  it.only('returns', function(done) {
    cleanup(blacklistFile, function(reply) {
      console.log(reply);
      done();
    });

  })
})
