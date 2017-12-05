'use strict';

var expect = require('chai').expect;
var archives = require('../../archives').init({
  apiUrl: 'https://webuild.sg/api/v1/',
  archives: {
    githubRepoFolder: 'webuildsg/archives/',
    committer: {
      name: 'We Build SG Bot',
      email: 'webuildsg@gmail.com'
    }
  }
});
var moment = require('moment-timezone');
var factory = require('../factory');

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
      expect(archives.getFilename('events').substring(15, 32)).to.equal(formattedDate)
    })
  })

  describe('#getCommitMessage', function() {
    it('returns commit message with date', function() {
      var formattedDate = moment().format('DD MMM YYYY h:mm a');
      expect(archives.getCommitMessage('events').substring(24, 44)).to.equal(formattedDate)
    })
  })

  describe('#getCurrentDayData', function() {
    describe('when the response is for events', function() {
      it('returns the upcoming day events', function(done) {
        var fakeData = JSON.stringify(factory.data.response.events);
        var reply = JSON.parse(archives.getCurrentDayData(fakeData, 'events'));

        expect(factory.data.response.events.events.length).to.be.above(2);
        expect(reply.meta).to.exist;
        expect(reply.events).to.exist;
        expect(reply.events.length).to.equal(2);
        done();
      })
    })

    describe('when the response is for repos', function() {
      it('returns the past day repos', function(done) {
        var fakeData = JSON.stringify(factory.data.response.repos);
        var reply = JSON.parse(archives.getCurrentDayData(fakeData, 'repos'));

        expect(factory.data.response.repos.repos.length).to.be.above(8);
        expect(reply.meta).to.exist;
        expect(reply.repos).to.exist;
        expect(reply.repos.length).to.equal(8);
        done();
      })
    })
  })

  // run with BOT_TOKEN=secret mocha
  describe('#storeToArchives', function() {
    // NOTE: Skipped because it sends an actual API call to github
    it.skip('returns commit message with date', function(done) {
      archives.storeToArchives('events', function(res) {
        console.log(res);
        expect(res).to.exist;
        done();
      })
    })
  })
});
