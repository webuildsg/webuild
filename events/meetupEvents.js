var querystring = require('querystring');
var moment = require('moment');
var utils = require('./utils');
var config = require('./config');

function isValidGroup(row) {
  'use strict';

  var blacklistGroups = config.blacklistGroups || [];
  var blacklistWords = config.blacklistWords || [];
  var blacklistRE = new RegExp(blacklistWords.join('|'), 'i');

  // Enforce country filter. Meetup adds JB groups into SG
  return blacklistWords.length === 0 ? true : !row.name.match(blacklistRE) && !blacklistGroups.some(function(id) { return row.id === id }) && row.country === (config.meetupParams.country || row.country);
}

function findNextEvents(eventsArr, row) {
  'use strict';

  if (!(row.next_event && row.next_event.time)) return eventsArr;

  var entry = {
    id: row.next_event.id,
    name: row.next_event.name,
    description: utils.htmlStrip(row.description),
    location: '',
    url: 'http://meetup.com/' + row.urlname + '/events/' + row.next_event.id,
    group_name: row.name,
    group_url: row.link,
    formatted_time: moment.utc(row.next_event.time + row.next_event.utc_offset).format(utils.timeformat),
    start_time: moment.utc(row.next_event.time).zone(row.next_event.utc_offset).toISOString()
  }
  eventsArr.push(entry);

  return eventsArr;
}

function getAllMeetupGroups() { //regardless of venue
  'use strict';

  var url = 'https://api.meetup.com/2/groups?' +
    querystring.stringify(config.meetupParams);

  return utils.prequest(url).then(function(data) {
    console.log('Fetched ' + data.results.length + ' Meetup groups');
    var events = [];
    data.results
      .filter(isValidGroup)
      .reduce(findNextEvents, events);
    return events;
  }).catch(function(err) {
    console.error('Error getAllMeetupGroups(): ' + err);
  });
}

function getMeetupEvents() { //events with eventsData
  'use strict';

  return getAllMeetupGroups().then(function(events) {
    console.log('Fetched ' + events.length + ' Meetup events');
    var eventsData = events.map(function(event) {
      return utils.prequest('https://api.meetup.com/2/event/'+ event.id + '?fields=venue_visibility&key='+ config.meetupParams.key);
    });

    return utils.waitAllPromises(eventsData).then(function(eventsData) {
      var eventsWithVenues = events.filter(function(evt, i) {
        if( eventsData[i].hasOwnProperty('venue') ||
          eventsData[i].venue_visibility === 'members'){
          if (eventsData[i].duration === undefined){
            eventsData[i].duration = 7200000
          }
          var location = eventsData[i].venue? ((eventsData[i].venue.address_1 || '') + (eventsData[i].venue.address_2 || '' )) : '';
          location += 'Singapore';
          evt.end_time = moment.utc(evt.start_time).add('milliseconds',eventsData[i].duration).zone(evt.start_time).toISOString();
          return true;
        }

      });
      console.log(eventsWithVenues.length + ' Meetup events with venues');
      return eventsWithVenues;
    }).catch(function(err) {
      console.error('Error getMeetupEvents(): ' + err);
    });
  });
}

exports.get = getMeetupEvents;
