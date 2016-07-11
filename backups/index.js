'use strict'
var moment = require('moment-timezone')
var request = require('request')
var clc = require('cli-color')

var logger = require('../lib/logger')

module.exports = function(config, db) {
  var filename = getFilename()
  var uri = 'https://api.github.com/repos/' + config.githubRepoFolder + 'contents/backups/' + filename
  var token = new Buffer(process.env.BOT_TOKEN.toString()).toString('base64')
  var content = new Buffer(JSON.stringify(db)).toString('base64')
  var body = {
    'message': getCommitMessage(),
    'committer': {
      'name': config.committer.name,
      'email': config.committer.email
    },
    'content': content,
    'branch': getBranchName()
  }

  request({
    method: 'PUT',
    uri: uri,
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'We Build ' + config.symbol + ' Backup',
      'Authorization': 'Basic ' + token
    },
    body: JSON.stringify(body)
  }, function (error, response) {
    if (error) {
      logger.error(clc.red(error))
    } else if (response.statusCode !== 201 && response.statusCode !== 200) {
      logger.error(clc.red(JSON.parse(response.body).message))
    } else {
      var reply = 'Backed up Firebase db ' + filename + ' to Github ' + config.githubRepoFolder + 'contents/backups in branch ' + getBranchName()
      logger.info(clc.green(reply))
    }
  })
}

function getBranchName () {
  if (process.env.NODE_ENV === 'production') {
    return 'gh-pages'
  }

  return 'staging'
}

function getFilename () {
  return 'backup_' + moment().format('YYYY_MM_DD_HHmmss') + '.json'
}

function getCommitMessage () {
  return 'backup Firebase DB on ' + moment().format('DD MMM YYYY h:mm a')
}
