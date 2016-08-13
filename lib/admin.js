'use strict'

var db = require('./database')
var moment = require('moment-timezone')
var auth = require('basic-auth')

// TODO: move to static config
var adminOriginUrls = [
  'https://webuild.sg',
  'https://production-webuildsg.rhcloud.com',
  'https://staging-webuildsg.rhcloud.com',
  'http://localhost:4000'
]

function formatDateTime (date, time) {
  var dateTime = date + ' ' + time
  return moment(dateTime, 'YYYY-MM-DD hh:mm').toISOString()
}

function format (date, time) {
  var dateTime = date + ' ' + time
  return moment(dateTime, 'YYYY-MM-DD hh:mm').format('DD MMM YYYY, ddd, hh:mm a')
}

module.exports = {
  addToWhitelistGroups: function (whitelistGroups) {
    whitelistGroups.forEach(function (eachGroup, index) {
      db.child('whitelistGroups').push().set(eachGroup)
    })
  },

  addToWhitelistEvents: function (eachEvent) {
    var whitelistEvent = {
      id: Math.floor(Math.random() * 10000),
      name: eachEvent.name,
      description: eachEvent.description,
      location: eachEvent.location,
      url: eachEvent.url,
      group_name: eachEvent.group_name,
      group_url: eachEvent.group_url,
      platform: 'manual',
      start_time: formatDateTime(eachEvent.start_time.date, eachEvent.start_time.time),
      end_time: formatDateTime(eachEvent.end_time.date, eachEvent.end_time.time),
      formatted_time: format(eachEvent.start_time.date, eachEvent.start_time.time)
    }

    if (eachEvent.latitude) {
      whitelistEvent.latitude = parseFloat(eachEvent.latitude)
    }

    if (eachEvent.longitude) {
      whitelistEvent.longitude = parseFloat(eachEvent.longitude)
    }

    db.child('whitelistEvents').push().set(whitelistEvent)
  },

  addToBlacklistGroups: function (blacklistGroups, platform) {
    var childName

    if (platform === 'eventbrite') {
      childName = 'eventbriteBlacklistOrganiserIds'
    } else if (platform === 'meetup') {
      childName = 'meetupBlacklistGroups'
    }

    blacklistGroups.forEach(function (eachGroupID, index) {
      db.child(childName).push().set(parseInt(eachGroupID))
    })
  },

  addToBlacklistEvents: function (blacklistEvents) {
    var childName = 'blacklistEvents'

    blacklistEvents.forEach(function (eachEvent, index) {
      eachEvent.id = parseInt(eachEvent.id)
      db.child(childName).push().set(eachEvent)
    })
  },

  removeBlacklistGroupEvents: function (eventsList, blacklistGroupList, platform) {
    return eventsList.filter(function (eachEvent) {
      return !blacklistGroupList.some(function (eachBlacklistGroupID) {
        if (eachEvent.platform === platform && eachEvent.group_id.toString() === eachBlacklistGroupID) {
          return true
        }
      })
    })
  },

  isAdmin: function (req) {
    var credentials = auth(req)
    return credentials && credentials.name === process.env.ADMIN_USERNAME && credentials.pass === process.env.ADMIN_PASSWORD
  },

  isValidOrigin: function (req) {
    return adminOriginUrls.some(eachUrl => eachUrl === req.get('Origin'))
  }
}
