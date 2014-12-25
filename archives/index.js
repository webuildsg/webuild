var Github = require('github-api'),
  moment = require('moment-timezone'),
  request = require('request'),
  github,
  repo = '',
  data = ''
  contents = '';

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
    prefix = 'events/events';
  } else {
    prefix = 'repos/repos';
  }

  return prefix + '_archive_' + moment().format('YYYY_MM_DD_HHmmss') + '.json';

}

function getCommitMessage(type) {
  return 'data: ' + type + ' archive on ' + moment().format('DD MMM YYYY h:mm a');
}

function storeToArchives(type, callback) {
  var github = new Github({
    type: 'oauth',
    token: process.env.BOT_TOKEN
  });
  var repo = github.getRepo('webuildsg', 'test');

  request('http://localhost:8000/s.json', function(err, msg, response) {
    if (err) {
      console.log(err);
      console.log(msg);
      console.error('We Build SG API reading Error');
      return;
    }

    console.log(response);

    callback(null);

    // repo.write(getBranchName(type), getFilename(type), response, getCommitMessage(type), function(err) {
    //   if (err) {
    //     console.error(err.request.responseText);
    //     callback('We Build SG Archives storing to Github Error');
    //     return;
    //   }
    //   callback('Archives for ' + type + ' stored successfully in github.com/webuildsg/archives');
    // });
  });

}

function update(callback) {
  console.log('Starting to store to Archives');
  storeToArchives('events', function(message) {
    console.log(message);
    // storeToArchives('repos', function(message) {
    //   console.log(message);
      callback(null);
    // })
  })
}

exports.getBranchName = getBranchName;
exports.getFilename = getFilename;
exports.getCommitMessage = getCommitMessage;
exports.storeToArchives = storeToArchives;
exports.update = update;
