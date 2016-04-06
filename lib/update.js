'use strict'

var logger = require('./logger')

module.exports = function (req, res, wb, type) {
  if (req.body.secret !== process.env.WEBUILD_API_SECRET) {
    res.status(503).send('Incorrect secret key')
    return
  }
  wb[ type ].update()

  var message = `Updating the ${type} feed sit tight!`
  logger.trace(message)
  res.status(200).send(message)
}
