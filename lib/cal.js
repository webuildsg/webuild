'use strict'

var ical = require('ical-generator')
var cal = ical()
var request = require('request')

module.exports = function(config, events, res) {
  cal.clear()
  cal.setDomain(config.domain).setName(config.calendarTitle)

  events.filter(function (thisEvent) {
    if (!(thisEvent.start_time && thisEvent.end_time && thisEvent.name && thisEvent.description)) {
      console.log('Not enough information on this event', thisEvent.name, thisEvent.start_time, thisEvent.end_time, thisEvent.description)
    }
    return thisEvent.start_time && thisEvent.end_time && thisEvent.name && thisEvent.description
  })
  .forEach(function (thisEvent) {
    cal.addEvent({
      start: new Date(thisEvent.start_time),
      end: new Date(thisEvent.end_time),
      summary: thisEvent.name + ' by ' + thisEvent.group_name,
      description: thisEvent.description + ' \n\nEvent URL: ' + thisEvent.url || thisEvent.group_url,
      location: thisEvent.location || config.city,
      url: thisEvent.url || thisEvent.group_url
    })
  })

  // add next We Build LIVE show date
  request(config.podcastApiUrl, function (err, msg, response) {
    if (err) {
      console.error(clc.red('Error: Fetching We Build Live podcast api'))
      return
    }
    response = JSON.parse(response)

    if (response.meta.next_live_show) {
      cal.addEvent({
        start: new Date(response.meta.next_live_show.start_time),
        end: new Date(response.meta.next_live_show.end_time),
        summary: response.meta.next_live_show.summary,
        description: response.meta.next_live_show.description + ' \n\nEvent URL: ' + response.meta.next_live_show.url,
        location: config.city,
        url: response.meta.next_live_show.url
      })
    }

    cal.serve(res)
  })
}
