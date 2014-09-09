'use strict';

var Promise = require('promise'),
  htmlStrip = require('htmlstrip-native');

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
  waitAllPromises: waitAllPromises,
  htmlStrip: htmlStripWrapper,
  timeformat: 'DD MMM, ddd, h:mm a',
  zone: '+0800'
}
