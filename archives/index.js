'use strict';

var moment = require('moment-timezone');
var request = require('request');
var clc = require('cli-color');

module.exports = {
  'init': function(config) {
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
      var url = config.apiUrl + type;

      request(url, function(err, msg, response) {
        if (err) {
          console.error(clc.red('Error: Reading We Build API '));
          console.log(err);
          console.log(msg);
          callback(err);
        }

        var filename = getFilename(type);
        var uri = 'https://api.github.com/repos/' + config.archives.githubRepoFolder + 'contents/' + type + '/v1/' + filename;
        var token = new Buffer(process.env.BOT_TOKEN.toString()).toString('base64');
        var content = new Buffer(response).toString('base64');
        var body = {
          'message': getCommitMessage(type),
          'committer': {
            'name': config.archives.committer.name,
            'email': config.archives.committer.email
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
            'User-Agent': 'We Build ' + config.symbol + ' Archives',
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
            var reply = 'Uploaded ' + filename + ' to Github ' + config.archives.githubRepoFolder + 'contents/' + type + ' in branch ' + getBranchName(type);
            callback(null, reply);
          }
        })
      });
    }

    function update() {
      function createCallbackHandler(type) {
        return function(error, reply) {
          if (error) {
            console.error(clc.red('Error: Cannot push to We Build Archives for ' + type + ': ' + error + '. Reply: ' + reply));
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

    return {
      'getBranchName': getBranchName,
      'getFilename': getFilename,
      'getCommitMessage': getCommitMessage,
      'storeToArchives': storeToArchives,
      'update': update
    }
  }
}
