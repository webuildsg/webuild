'use strict';

var expect = require('chai').expect;
var cleanup = require('../../events/cleanup');
var moment = require('moment-timezone');
var fs = require('fs');

describe('Remove past manual events', function() {

  describe('when all events are before 1 day ago', function() {
    it('returns zero for number of events to keep', function() {
      var currentDir = __dirname;
      var filepath = currentDir.substring(0, currentDir.length - 12) + '/test/fixtures/blacklistEvents.json';
      var eventsToKeep = cleanup.getEventsToKeep(filepath);
      expect(eventsToKeep.length).to.be.zero;
    })
  })

  describe('when 3 events are after 1 day ago', function() {
    var blacklistEvents = [];

    beforeEach(function(done) {
      blacklistEvents = [
        {
          id: 'qngrzhysmbhc',
          url: 'http://www.meetup.com/Singapore-Cloud-Big-Data-DevOps-Meetups/events/204796542/',
          formatted_time: moment().add(1, 'day').format('DD MMM YYYY, ddd, hh:mm a')
        },
        {
          id: '183573492',
          url: 'http://meetup.com/Agile-Singapore/events/183573492',
          formatted_time: moment().add(2, 'day').format('DD MMM YYYY, ddd, hh:mm a')
        },
        {
          id: '13093118871',
          url: 'https://www.eventbriteapi.com/v3/organizers/7413275201',
          formatted_time: moment().add(3, 'day').format('DD MMM YYYY, ddd, hh:mm a')
        },
        {
          id: '13306019663',
          formatted_time: '16 Oct 2014, Thu, 7:30 pm'
        },
        {
          id: '13306129993',
          formatted_time: '16 Oct 2014, Thu, 7:30 pm'
        },
        {
          id: '322218307949631',
          url: 'https://www.facebook.com/events/322218307949631',
          formatted_time: '14 Oct 2014, Tue, 7:00 pm'
        }
      ];

      fs.writeFile('./test/fixtures/blacklistEvents2future.json', JSON.stringify(blacklistEvents, null, 2), function(err) {
        if (err) {
          throw err;
        }
        done();
      });
    })

    it('returns 3 for number of events to keep', function() {
      var currentDir = __dirname;
      var filepath = currentDir.substring(0, currentDir.length - 12) + '/test/fixtures/blacklistEvents2future.json';
      var eventsToKeep = cleanup.getEventsToKeep(filepath);

      expect(eventsToKeep.length).to.equal(3);
    })
  })

})
