'use strict';

var expect = require('chai').expect,
  repos = require('../../repos'),
  moment = require('moment-timezone'),
  factory = require('../factory');

describe('#pushed3MonthsAgo', function() {
  var reply;

  beforeEach(function() {
    reply = repos.pushed3MonthsAgo()
  })

  it('returns date with 10 characters', function() {
    expect(reply.length).to.equal(10)
  })

  it('returns year 3 months ago', function() {
    var now = new Date();
    expect(reply.substring(0, 4)).to.contain(201)
  })

  it('returns same day 3 months ago', function() {
    var now = new Date();
    expect(reply.substring(8, 10)).to.contain(now.getDate());
  })

  it('returns date in dashes', function() {
    expect(reply.substring(4,5)).to.equal('-')
    expect(reply.substring(7,8)).to.equal('-')
  })
})
