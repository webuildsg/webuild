'use strict'

var logger = require('./logger')
var db = require('./database')

module.exports = {
  addToWhitelistGroups: function (whitelistGroups, meta) {
    var lastID = parseInt(meta.last_whitelistGroups_id) + 1

    whitelistGroups.forEach(function (eachGroup) {
      db.child('whitelistGroups/' + lastID).set(eachGroup, function (error) {
        if (error) {
          logger.error(error)
        } else {
          db.child('meta/last_whitelistGroups_id').set(lastID)
        }
      })
    })
  }
}
