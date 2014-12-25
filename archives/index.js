'use strict';

var moment = require('moment-timezone'),
  request = require('request');

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
    prefix = 'events/events/v1';
  } else {
    prefix = 'repos/repos/v1';
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

    var filename = getFilename(type),
      uri = 'https://api.github.com/repos/webuildsg/archives/contents/' + filename,
      token = new Buffer(process.env.BOT_TOKEN.toString()).toString('base64'),
      content = new Buffer(response).toString('base64'),
      body = {
        'message': getCommitMessage(type),
        'committer': {
          'name': 'We Build SG Bot',
          'email': 'webuildsg@gmail.com'
        },
      'content': content,
      'branch': getBranchName(type)
    }

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
    function(error) {
      if (error) {
        return console.error('upload failed:', error);
      }
      callback('Uploaded ' + filename + ' to Github webuildsg/archives/' + type + ' in branch ' + getBranchName(type));
    })
  });

}

function update(callback) {
  var count = 0;

  storeToArchives('repos', function(message) {
    console.log(message);
    count++;

    if (count > 1) {
      callback(null);
    }
  })

  storeToArchives('events', function(message) {
    console.log(message);
    count++;

    if (count > 1) {
      callback(null);
    }
  })
}

exports.getBranchName = getBranchName;
exports.getFilename = getFilename;
exports.getCommitMessage = getCommitMessage;
exports.storeToArchives = storeToArchives;
exports.update = update;
