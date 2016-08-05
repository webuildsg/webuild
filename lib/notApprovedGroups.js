'use strict'

module.exports = function (events, whitelistGroups) {
  function isNotEventInApprovedGroup (eachEvent) {
    return whitelistGroups.every(function (eachGroup) {
      return eachGroup.group_url !== eachEvent.group_url &&
        eachGroup.group_name !== eachEvent.group_name
    })
  }

  function isNotManuallyAddedEvent (eachEvent) {
    // if the event is already added manually,
    // it should not be part of admin's consideration to add / remove the event
    return eachEvent.platform !== 'manual'
  }

  function eventsToUniqGroups (groupsArray, eachEvent) {
    var doesGroupExist = groupsArray.some(function (eachGroup) {
      return eachGroup.group_name === eachEvent.group_name &&
      eachGroup.group_url === eachEvent.group_url
    })

    if (!doesGroupExist) {
      groupsArray.push({
        group_id: eachEvent.group_id,
        group_name: eachEvent.group_name,
        group_url: eachEvent.group_url,
        upcoming_event_name: eachEvent.name,
        upcoming_event_url: eachEvent.url,
        platform: eachEvent.platform,
        formatted_time: eachEvent.formatted_time
      })
    }

    return groupsArray
  }

  var eventsNotInApprovedGroups = events
    .filter(isNotEventInApprovedGroup)
    .filter(isNotManuallyAddedEvent)

  return eventsNotInApprovedGroups.reduce(eventsToUniqGroups, [])
}
