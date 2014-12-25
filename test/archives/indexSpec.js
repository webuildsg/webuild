'use strict';

var expect = require('chai').expect,
  archives = require('../../archives'),
  moment = require('moment-timezone');

describe('Archives', function() {

  describe('#getBranchName', function() {

    it('returns "staging" if NODE_ENV is "test"', function() {
      process.env.NODE_ENV = 'test';
      expect(archives.getBranchName('events')).to.equal('staging')
    })

    it('returns "staging" if NODE_ENV is "staging"', function() {
      process.env.NODE_ENV = 'staging';
      expect(archives.getBranchName('events')).to.equal('staging')
    })

    it('returns "master" NODE_ENV is "production"', function() {
      process.env.NODE_ENV = 'production';
      expect(archives.getBranchName('events')).to.equal('master')
    })
  })

  describe('#getFilename', function() {
    it('returns formatted filename YYYY_MM_DD_HHmmss', function() {
      var formattedDate = moment().format('YYYY_MM_DD_HHmmss');
      expect(archives.getFilename('events').substring(22, 39)).to.equal(formattedDate)
    })
  })

  describe('#getCommitMessage', function() {
    it('returns commit message with date', function() {
      var formattedDate = moment().format('DD MMM YYYY h:mm a');
      expect(archives.getCommitMessage('events').substring(24, 43)).to.equal(formattedDate)
    })
  })

  describe.skip('#storeToArchives', function() {
    // sends an actual API call to github
    // run with BOT_TOKEN=secret mocha
    it('returns commit message with date', function(done) {
      archives.storeToArchives('events', function(res) {
        console.log(res);
        expect(res).to.exist;
        done();
      })
    })
  })
});

