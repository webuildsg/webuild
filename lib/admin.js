'use strict'

var db = require('./database')

module.exports = {
  addToWhitelistGroups: function (whitelistGroups) {
    whitelistGroups.forEach(function (eachGroup, index) {
      db.child('whitelistGroups').push().set(eachGroup)
    })
  }
}
