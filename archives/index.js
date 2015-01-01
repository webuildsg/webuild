'use strict';

var moment = require('moment-timezone');
var request = require('request');

function getBranchName() {
  if (process.env.NODE_ENV === 'production') {
    return 'master'
  } else {
    return 'staging'
  }
}

function getFilename(type) {
  var prefix = '';

  if (type === 'events') {
    prefix = 'events';
  } else {
    prefix = 'repos';
  }

  return prefix + '_archive_' + moment().format('YYYY_MM_DD_HHmmss') + '.json';

}

function getCommitMessage(type) {
  return 'data: ' + type + ' archive on ' + moment().format('DD MMM YYYY h:mm a');
}

function storeToArchives(type, callback) {
  var url = 'https://webuild.sg/api/v1/' + type;

  request(url, function(err, msg, response) {
    if (err) {
      console.error('We Build SG API reading Error:');
      console.log(err);
      console.log(msg);
      callback(err);
    }

    var filename = getFilename(type);
    var uri = 'https://api.github.com/repos/webuildsg/archives/contents/' + type + '/v1/' + filename;
    var token = new Buffer(process.env.BOT_TOKEN.toString()).toString('base64');
    var content = new Buffer(response).toString('base64');
    var body = {
      'message': getCommitMessage(type),
      'committer': {
        'name': 'We Build SG Bot',
        'email': 'webuildsg@gmail.com'
      },
      'content': content,
      'branch': getBranchName(type)
    };

    request({
      method: 'PUT',
      uri: uri,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'We Build SG Archives',
        'Authorization': 'Basic ' + token
      },
      body: JSON.stringify(body)
    },
    function(error, response) {
      if (error) {
        callback(error, null);
      } else if (response.statusCode !== 201 && response.statusCode !== 200) {
        callback(new Error(), JSON.parse(response.body).message);
      } else {
        var reply = 'Uploaded ' + filename + ' to Github webuildsg/archives/' + type + ' in branch ' + getBranchName(type);
        callback(null, reply);
      }
    })
  });

}

function update() {
  function createCallbackHandler(type) {
    return function(error, reply) {
      if (error) {
        console.error('Error: Cannot push to We Build Archives for ' + type + ': ' + error + '. Reply: ' + reply);
      } else {
        console.log(reply);
      }
    }
  }

  storeToArchives('repos', createCallbackHandler('repos'));
  setTimeout(function() {
    storeToArchives('events', createCallbackHandler('events'))
  }, 5000)

}

exports.getBranchName = getBranchName;
exports.getFilename = getFilename;
exports.getCommitMessage = getCommitMessage;
exports.storeToArchives = storeToArchives;
exports.update = update;
