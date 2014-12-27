'use strict';

var expect = require('chai').expect;
var ics = require('../../events/icsEvents');
var moment = require('moment-timezone');

describe('Read events from iCal ics format', function() {

  describe.skip('#normaliseEvents get events', function() {
    // enable this test to make an actual call to the ics urls
    it('returns event details', function(done) {
      ics.get(function(events) {
        console.log(events);
        done();
      })
    })
  })

  describe.skip('#getAllIcsGroups', function() {
    // enable this test to make an actual call to the ics urls
    it('returns event details', function(done) {
      ics.getAllIcsGroups(function(events) {
        console.log(events);
        done();
      })
    })
  })

  describe('#trimAfterAt', function() {
    it('returns all characters before the @ symbol', function() {
      var check = ics.trimAfterAt('dn8618poqgkvtlvrb6ta0pa1mg@google.com');
      expect(check).to.equal('dn8618poqgkvtlvrb6ta0pa1mg')
    })

    it('returns all characters before the first @ symbol', function() {
      var check = ics.trimAfterAt('dn8618poqgkvtlvrb6ta0pa1mg@google@google.com');
      expect(check).to.equal('dn8618poqgkvtlvrb6ta0pa1mg')
    })
  })

  describe('#getUrlfromDescriptionOrGroupUrl', function() {

    it('returns url when url exists', function() {
      var eventToCheck = {
        url: 'https://webuild.sg',
        group_url: 'http://group_url.com'
      }
      expect(ics.getUrlfromDescriptionOrGroupUrl(eventToCheck)).to.equal(eventToCheck.url)
    })

    it('returns url from description when url does not exist', function() {
      var eventToCheck = {
        description: 'hello https://webuild.sg'
      }
      expect(ics.getUrlfromDescriptionOrGroupUrl(eventToCheck)).to.equal('https://webuild.sg')
    })

    it('returns url from description when url is null', function() {
      var eventToCheck = {
        url: null,
        description: 'hello https://webuild.sg'
      }
      expect(ics.getUrlfromDescriptionOrGroupUrl(eventToCheck)).to.equal('https://webuild.sg')
    })

    it('returns url from description when url is empty', function() {
      var eventToCheck = {
        url: '',
        description: 'hello https://webuild.sg'
      }
      expect(ics.getUrlfromDescriptionOrGroupUrl(eventToCheck)).to.equal('https://webuild.sg')
    })

    it('returns url from description when url is undefined', function() {
      var eventToCheck = {
        url: undefined,
        description: 'hello https://webuild.sg'
      }
      expect(ics.getUrlfromDescriptionOrGroupUrl(eventToCheck)).to.equal('https://webuild.sg')
    })

    it('returns group_url when description and url are undefined', function() {
      var eventToCheck = {
        url: undefined,
        description: undefined,
        group_url: 'https://webuild.sg'
      }
      expect(ics.getUrlfromDescriptionOrGroupUrl(eventToCheck)).to.equal('https://webuild.sg')
    })

    it('returns group_url when description and url are null', function() {
      var eventToCheck = {
        url: null,
        description: null,
        group_url: 'https://webuild.sg'
      }
      expect(ics.getUrlfromDescriptionOrGroupUrl(eventToCheck)).to.equal('https://webuild.sg')
    })

    it('returns group_url when description and url are empty', function() {
      var eventToCheck = {
        url: '',
        description: '',
        group_url: 'https://webuild.sg'
      }
      expect(ics.getUrlfromDescriptionOrGroupUrl(eventToCheck)).to.equal('https://webuild.sg')
    })

    it('returns group_url when description has no hyperlinks and url is empty', function() {
      var eventToCheck = {
        url: '',
        description: 'hello',
        group_url: 'https://webuild.sg'
      }
      expect(ics.getUrlfromDescriptionOrGroupUrl(eventToCheck)).to.equal('https://webuild.sg')
    })
  })

  describe('#hasLocation', function() {
    it('returns true if location contains "Singapore"', function() {
      var eventToCheck = {
        location: 'Chinatown, Singapore'
      }
      expect(ics.hasLocation(eventToCheck)).to.be.true;
    })

    it('returns false if location does not contain "Singapore"', function() {
      var eventToCheck = {
        location: 'Yerba Buena Gardens, 750 Howard St, San Francisco, CA 94103, United States'
      }
      expect(ics.hasLocation(eventToCheck)).to.be.false;
    })

    it('returns with "Singapore" if the group is "SG Hack and Tell', function() {
      var eventToCheck = {
        group_name: 'SG Hack & Tell',
        location: 'Hackerspace.SG, 344B King George\'s Avenue'
      }
      expect(ics.hasLocation(eventToCheck)).to.contain('Singapore');
    })
  })

  describe('#isInFuture', function() {
    it('returns true if the start_time is in future', function() {
      var eventToCheck = {
        start_time: moment().add(2, 'day').utc()
      }

      expect(ics.isInFuture(eventToCheck)).to.be.true;
    })

    it('returns false if the start_time is in the past', function() {
      var eventToCheck = {
        start_time: moment().subtract(2, 'day').utc()
      }

      expect(ics.isInFuture(eventToCheck)).to.be.false;
    })
  })

})
