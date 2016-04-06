'use strict'

module.exports = function (events, whitelistGroups) {
  function isNotEventInApprovedGroup (eachEvent) {
    return whitelistGroups.every(function (eachGroup) {
      return eachGroup.group_url !== eachEvent.group_url &&
        eachGroup.group_name !== eachEvent.group_name
    })
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
        group_url: eachEvent.group_url
      })
    }

    return groupsArray
  }

  var eventsNotInApprovedGroups = events.filter(isNotEventInApprovedGroup)
  return eventsNotInApprovedGroups.reduce(eventsToUniqGroups, [])
}
