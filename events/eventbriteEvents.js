'use strict';

var querystring = require('querystring'),
  prequest = require('prequest'),
  moment = require('moment'),
  utils = require('./utils'),
  config = require('./config'),
  baseUrl = 'https://www.eventbriteapi.com/v3/events/search',
  techCategory = [ '102', '119'];

function constructAddress(venue) {
  var addr = venue.location,
    address = [
      venue.name.trimRight(),
      ', ',
      addr.address_1.trimRight(),
      addr.address_2 ? ', ' + addr.address_2.trimRight() : '',
      ', ',
      addr.city + ' ' + addr.postal_code
    ].join('');

  return address;
}

function isFreeWithVenue(event) {
  var hasVenue = event.venue.location && event.venue.location.address_1 !== null,
    isFree = event.ticket_classes.some(function(ticket) {
    return ticket.free;
  });

  return isFree && hasVenue;
}

function isInTechCategory(event){
  // 'categories': '102, 113, 199',
  return event.category_id && techCategory.indexOf(event.category_id) >= 0;
}

function addEventbriteEvent(arr, event) {
  arr.push({
    id: event.id,
    name: event.name.text,
    description: event.description.text,
    location: constructAddress(event.venue),
    url: event.url,
    group_name: event.organizer.name,
    group_url: event.organizer.resource_uri,
    formatted_time: utils.formatLocalTime(event.start.utc),
    start_time: event.start.utc,
    end_time: event.end.utc
  });

  return arr;
}

function getEventbriteEvents() {
  return prequest({
    url: baseUrl + '?' + querystring.stringify({
      'venue.country': 'SG',
      'venue.city': 'Singapore',
      'start_date.range_end': moment().add(2, 'months').format('YYYY-MM-DD') + 'T00:00:00Z'
    }),
    headers: {
      Authorization: 'Bearer ' + config.eventbrite.token
    }
  }).then(function(data) {
    var events = [],
      freeEventsWithVenue = data.events.filter(isInTechCategory).filter(isFreeWithVenue);
    freeEventsWithVenue.reduce(addEventbriteEvent, events);

    console.log(events.length + ' eventbrite events');
    return events;
  });
}

exports.get = getEventbriteEvents;
