'use strict';

var fs    = require('fs');

module.exports = function(filepath, callback) {
  console.log('FILE PATH: ' + filepath);

  fs.readFile(filepath, 'utf8', function(err, data) {
    if (err) {
      return console.log('Error in reading file: ' + err);
    }
    callback(JSON.parse(data));
  });

}
