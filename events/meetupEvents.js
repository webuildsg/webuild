var querystring = require('querystring');
var moment = require('moment');
var utils = require('./utils');
var config = require('./config');

function constructAddress(venue) {
  'use strict';

  var address = '';

  if (venue) {
    address = venue.name + ', ' + venue.address_1 || '' + (venue.address_2 ? ', ' + venue.address_2 : '');
    address += address.indexOf(config.meetupParams.city) === -1 ? ', ' + config.meetupParams.city : '';
    console.log(address)
  } else {
    address = config.meetupParams.city;
  }

  return address;
}

function isValidGroup(row) {
  'use strict';

  var blacklistGroups = config.blacklistGroups || [];
  var blacklistWords = config.blacklistWords || [];
  var blacklistRE = new RegExp(blacklistWords.join('|'), 'i');

  // Enforce country filter. Meetup adds JB groups into SG
  return blacklistWords.length === 0 ? true : !row.name.match(blacklistRE) && !blacklistGroups.some(function(id) { return row.id === id }) && row.country === (config.meetupParams.country || row.country);
}

function findGroupEvents(eventsArr, row) {
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

function findCommunityEvents(eventsArr, row) {
  'use strict';

  if (!(row.time && row.venue_name)) return eventsArr;

  var event_time = moment.utc(row.time).zone('+0800')
  row.name = row.venue_name;
  row.address_1 = row.address1 || '';

  var entry = {
    id: row.id.toString(),
    name: row.short_description,
    description: utils.htmlStrip(row.description),
    location: constructAddress(row),
    url: row.meetup_url,
    group_name: row.container.name + ' Community',
    group_url: 'http://meetup.com/' + row.container.urlname + '/' + row.community.urlname,
    formatted_time: event_time.format(utils.timeformat),
    start_time: event_time.toISOString(),
    end_time: event_time.add('milliseconds', 7200000).toISOString()
  }
  eventsArr.push(entry);

  return eventsArr;
}

function findEventsWithVenues(eventsData) {
  'use strict';

  return function(evt, i) {
    if (eventsData[i].hasOwnProperty('venue') || eventsData[i].venue_visibility === 'members') {
      if (eventsData[i].duration === undefined) {
        eventsData[i].duration = 7200000
      }
      evt.location = constructAddress(eventsData[i].venue);
      evt.end_time = moment.utc(evt.start_time).add('milliseconds', eventsData[i].duration).zone(evt.start_time).toISOString();
      return true;
    }
  }
}

function getMeetupGroups() { //regardless of venue
  'use strict';

  var url = 'https://api.meetup.com/2/groups?' +
    querystring.stringify(config.meetupParams);

  return utils.prequest(url).then(function(data) {
    console.log('Fetched ' + data.results.length + ' Meetup groups');
    var events = [];
    data.results
      .filter(isValidGroup)
      .reduce(findGroupEvents, events);
    return events;
  }).catch(function(err) {
    console.error('Error getMeetupGroups(): ' + err);
  });
}

function getMeetupCommunityEvents() {
  'use strict';

  var url = 'https://api.meetup.com/ew/events?' +
    querystring.stringify({
      key: config.meetupParams.key,
      country: config.meetupParams.country,
      city: config.meetupParams.city,
      urlname: config.meetupCommunities.join(','),
      after: '0d'
    });

  return utils.prequest(url).then(function(data) {
    console.log(data.results.length + ' Meetup community events with venues');
    var events = [];
    data.results.reduce(findCommunityEvents, events);
    return events;
  }).catch(function(err) {
    console.error('Error getMeetupCommunityEvents(): ' + err);
  });
}

function getMeetupEvents() { //events with eventsData
  'use strict';

  return getMeetupGroups().then(function(events) {
    console.log('Fetched ' + events.length + ' Meetup group events');
    var eventReqs = events.map(function(event) {
      return utils.prequest('https://api.meetup.com/2/event/'+ event.id + '?fields=venue_visibility&key='+ config.meetupParams.key);
    });

    return utils.waitAllPromises(eventReqs).then(function(eventsData) {
      return getMeetupCommunityEvents().then(function(communityEvents) {
        var eventsWithVenues = events.filter(findEventsWithVenues(eventsData));
        eventsWithVenues = eventsWithVenues.concat(communityEvents);
        console.log(eventsWithVenues.length + ' Meetup events with venues');
        return eventsWithVenues;
      });
    }).catch(function(err) {
      console.error('Error getMeetupEvents(): ' + err);
    });
  });
}

exports.get = getMeetupEvents;
