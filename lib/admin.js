'use strict'

var db = require('./database')

module.exports = {
  addToWhitelistGroups: function (whitelistGroups) {
    whitelistGroups.forEach(function (eachGroup, index) {
      db.child('whitelistGroups').push().set(eachGroup)
    })
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
  }
}
