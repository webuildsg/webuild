'use strict';

var Promise = require('promise'),
  request = require('request'),
  htmlStrip = require('htmlstrip-native');

function prequest(url, options) {
  options = options || {};
  options.url = url;
  options.json = true;
  return new Promise(function(resolve, reject) {
    request(options, function(err, resp, body) {
      if (err) {
        return reject(err);
      }

      if (resp.statusCode === 200) {
        resolve(body);
      } else {
        console.error('Err! HTTP status code:', resp.statusCode, url);
        reject(JSON.stringify(body));
      }
    });
  });
}

function waitAllPromises(arr) {
  return new Promise(function(resolve, reject) {
    var numResolved = 0,
      numErrors = 0;

    if (arr.length === 0) {
      return resolve([]);
    }

    function save(i, val) {
      arr[i] = val
      if (numErrors === arr.length) {
        reject(arr[0].error);
      } else if (++numResolved === arr.length) {
        resolve(arr);
      }
    }

    arr.forEach(function(item, i) {
      item.then(function(val) {
        save(i, val);
      }).catch(function(err) {
        ++numErrors;
        save(i, {
          'error': err
        }); // resolve errors
      });
    });
  });
}

function htmlStripWrapper(str) {
  if (!str) {
    return ''
  }
  return htmlStrip.html_strip(str, {
    include_script: false,
    include_style: false,
    compact_whitespace: true
  });
}

module.exports = {
  prequest: prequest,
  waitAllPromises: waitAllPromises,
  htmlStrip: htmlStripWrapper,
  timeformat: 'DD MMM, ddd, h:mm a',
  zone: '+0800'
}
