'use strict';

var expect = require('chai').expect,
  events = require('../../events'),
  factory = require('../factory');

describe('Remove duplicate events', function() {
  it('removes similar named events', function() {
    var similarEventFeed = factory.data.similarEventFeed;

    expect(similarEventFeed.length).to.be.equal(2);
    events.removeDuplicates(similarEventFeed);
    expect(similarEventFeed.length).to.be.equal(1);
  })

  it('removes exact named events', function() {
    var duplicateEventFeed = factory.data.duplicateEventFeed;

    expect(duplicateEventFeed.length).to.be.equal(3);
    events.removeDuplicates(duplicateEventFeed);
    expect(duplicateEventFeed.length).to.be.equal(1);
  })
})
