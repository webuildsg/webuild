'use strict';

var querystring = require('querystring');
var prequest = require('prequest');
var moment = require('moment-timezone');
var utils = require('./utils');
var Promise = require('promise');
var config = require('./config');
var clc = require('cli-color');
var baseUrl = 'https://www.eventbriteapi.com/v3/events/search';
var techCategory = [
  '102',
  '119'
];

function constructAddress(venue) {
  var addr = venue.address;
  var address = [
    venue.name ? venue.name.trimRight() : '',
    ', ',
    addr.address_1 ? ', ' + addr.address_1.trimRight() : '',
    addr.address_2 ? ', ' + addr.address_2.trimRight() : '',
    ', ',
    addr.city + ' ' + addr.postal_code
  ].join('');

  return address;
}

function isFreeWithVenue(event) {
  var hasVenue = event.venue.address && event.venue.address.address_1 !== null;
  var isFree = event.ticket_classes.some(function(ticket) {
    return ticket.free;
  });

  return isFree && hasVenue;
}

function isInTechCategory(event) {
  // 'categories': '102, 113, 199',
  return event.category_id && techCategory.indexOf(event.category_id) >= 0;
}

function isInWhitelist(thisEvent) {
  var countMatchId = 0;

  config.eventbrite.blacklistOrganiserId.forEach(function(id) {
    if (thisEvent.organizer.resource_uri.substring(44, 54) === id.toString()) {
      countMatchId++;
      console.log(clc.magenta('Info: Remove ' + thisEvent.organizer.url));
    }
  })

  if (countMatchId > 0) {
    return false;
  } else {
    return true;
  }
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
  var allEvents;
  var getEventsForPage = function(pageNum) {
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
    console.log(clc.blue('Info: Found ' + data.pagination.object_count + ' eventbrite.com events found in SG in ' + data.pagination.page_count + ' pages'));
    allEvents = data.events;

    var promisesArray = [];
    var pageCount;

    for (pageCount = 2; pageCount <= data.pagination.page_count; pageCount++) {
      promisesArray.push(getEventsForPage(pageCount));
    }

    return new Promise(function(resolve, reject) {
      utils.waitAllPromises(promisesArray).then(function(dataArray) {
        dataArray.forEach(function(data) {
          allEvents = allEvents.concat(data.events);
        });

        var techEvents;
        var freeTechEvents;
        var whitelistEvents;
        var events = [];

        techEvents = allEvents.filter(isInTechCategory);
        console.log(clc.blue('Info: Found ' + techEvents.length + ' eventbrite.com tech category events'));

        freeTechEvents = techEvents.filter(isFreeWithVenue);
        console.log(clc.blue('Info: Found ' + freeTechEvents.length + ' free eventbrite.com tech category events'));

        whitelistEvents = freeTechEvents.filter(isInWhitelist);
        console.log(clc.blue('Info: Found ' + whitelistEvents.length + ' free allowed eventbrite.com tech category events'));

        whitelistEvents.reduce(addEventbriteEvent, events);
        resolve(events);

      }).catch(function(err) {
        console.error(clc.red('Error: Getting eventbrite.com events'));
        reject(err);
      });
    });
  });
}

exports.get = getEventbriteEvents;
