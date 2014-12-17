'use strict';

var expect = require('chai').expect;
var cleanup = require('../../events/cleanup');
var moment = require('moment-timezone');

describe('Remove past manual events', function() {
  var blacklistEvents = []

  describe('when all events are before 1 day ago', function() {
    beforeEach(function() {
      blacklistEvents = [
        {
          "id": "qngrzhysmbhc",
          "url": "http://www.meetup.com/Singapore-Cloud-Big-Data-DevOps-Meetups/events/204796542/",
          "formatted_time": "25 Dec, Thu, 9:00 am"
        },
        {
          "id": "183573492",
          "url": "http://meetup.com/Agile-Singapore/events/183573492",
          "formatted_time": "12 Sep, Wed, 8:30 am"
        },
        {
          "id": "13093118871",
          "url": "https://www.eventbriteapi.com/v3/organizers/7413275201",
          "formatted_time": "16 Oct, Thu, 7:30 pm"
        },
        {
          "id": "13306019663",
          "formatted_time": "16 Oct, Thu, 7:30 pm"
        },
        {
          "id": "13306129993",
          "formatted_time": "16 Oct, Thu, 7:30 pm"
        },
        {
          "id": "322218307949631",
          "url": "https://www.facebook.com/events/322218307949631",
          "formatted_time": "14 Oct, Tue, 7:00 pm"
        }
      ];
    })

    it('returns zero for number of events to keep', function() {
      var eventsToKeep = cleanup.getEventsToKeep(blacklistEvents);
      expect(eventsToKeep.length).to.be.zero;
    })
  })

  describe('when 2 events are after 1 day ago', function() {
    beforeEach(function() {
      blacklistEvents = [
        {
          "id": "qngrzhysmbhc",
          "url": "http://www.meetup.com/Singapore-Cloud-Big-Data-DevOps-Meetups/events/204796542/",
          "formatted_time": moment().add(10, 'day').format('DD MMM, ddd, hh:mm a')
        },
        {
          "id": "183573492",
          "url": "http://meetup.com/Agile-Singapore/events/183573492",
          "formatted_time": moment().add(5, 'day').format('DD MMM, ddd, hh:mm a')
        },
        {
          "id": "13093118871",
          "url": "https://www.eventbriteapi.com/v3/organizers/7413275201",
          "formatted_time": "16 Oct, Thu, 7:30 pm"
        },
        {
          "id": "13306019663",
          "formatted_time": "16 Oct, Thu, 7:30 pm"
        },
        {
          "id": "13306129993",
          "formatted_time": "16 Oct, Thu, 7:30 pm"
        },
        {
          "id": "322218307949631",
          "url": "https://www.facebook.com/events/322218307949631",
          "formatted_time": "14 Oct, Tue, 7:00 pm"
        }
      ];
    })

    it('returns 2 for number of events to keep', function() {
      var eventsToKeep = cleanup.getEventsToKeep(blacklistEvents);
      expect(eventsToKeep.length).to.equal(2);
    })
  })


})
