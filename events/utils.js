'use strict';

var Promise = require('promise');
var htmlStrip = require('htmlstrip-native');
var moment = require('moment-timezone');
var displayTimeformat = 'DD MMM YYYY, ddd, h:mm a';
var localZone = '+0800';

function waitAllPromises(arr) {
  return new Promise(function(resolve, reject) {
    var numResolved = 0;
    var numErrors = 0;

    if (arr.length === 0) {
      return resolve([]);
    }

    function save(i, val) {
      arr[ i ] = val
      if (numErrors === arr.length) {
        reject(arr[ 0 ].error);
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

function localTime(time) {
  return moment.utc(time).zone(localZone);
}

function formatLocalTime(time) {
  return moment.utc(time).zone(localZone).format(displayTimeformat);
}

module.exports = {
  waitAllPromises: waitAllPromises,
  htmlStrip: htmlStripWrapper,
  localTime: localTime,
  formatLocalTime: formatLocalTime,
  timeformat: displayTimeformat
}
