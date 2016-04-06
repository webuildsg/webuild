var Firebase = require('firebase')
var db = new Firebase(process.env.FIREBASE_URL)
var logger = require('./logger')

db.authWithPassword({
  email: process.env.FIREBASE_EMAIL,
  password: process.env.FIREBASE_PASSWORD
}, function(error) {
  if (error) {
    logger.error(error)
  } else {
    logger.info('Connected to Firebase db!')
  }
})

module.exports = db
