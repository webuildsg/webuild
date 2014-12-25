'use strict';

var querystring = require('querystring'),
  prequest = require('prequest'),
  moment = require('moment-timezone'),
  utils = require('./utils'),
  Promise = require('promise'),
  config = require('./config'),
  baseUrl = 'https://www.eventbriteapi.com/v3/events/search',
  techCategory = [
    '102',
    '119'
  ];

function constructAddress(venue) {
  var addr = venue.address,
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
  var hasVenue = event.venue.address && event.venue.address.address_1 !== null,
    isFree = event.ticket_classes.some(function(ticket) {
    return ticket.free;
  });

  return isFree && hasVenue;
}

function isInTechCategory(event) {
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
  var allEvents,
    getEventsForPage = function(pageNum) {
    return prequest({
      url: baseUrl + '?' + querystring.stringify({
        'venue.country': 'SG',
        'venue.city': 'Singapore',
        'start_date.range_end': moment().add(2, 'months').format('YYYY-MM-DD') + 'T00:00:00Z',
        'page': pageNum
      }),
      headers: {
        Authorization: 'Bearer ' + config.eventbrite.token
      }
    })
  };

  return getEventsForPage(1).then(function(data) {
    console.log(data.pagination.object_count + ' Eventbrite events found in SG in ' + data.pagination.page_count + ' pages.');
    allEvents = data.events;

    var promisesArray = [], pageCount;

    for (pageCount = 2; pageCount <= data.pagination.page_count; pageCount++) {
      promisesArray.push(getEventsForPage(pageCount));
    }

    return new Promise(function(resolve, reject) {
      utils.waitAllPromises(promisesArray).then(function(dataArray) {
        dataArray.forEach(function(data) {
          allEvents = allEvents.concat(data.events);
        });

        var techEvents, freeTechEvents, events = [];

        techEvents = allEvents.filter(isInTechCategory);
        console.log(techEvents.length + ' Eventbrite events in the Tech category in SG');

        freeTechEvents = techEvents.filter(isFreeWithVenue);
        console.log(freeTechEvents.length + ' free Eventbrite events in the Tech category in SG');

        freeTechEvents.reduce(addEventbriteEvent, events);
        resolve(events);

      }).catch(function(err) {
        console.error('Error getting Eventbrite Events ');
        reject(err);
      });
    });
  });
}

exports.get = getEventbriteEvents;
