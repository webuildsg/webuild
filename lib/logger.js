'use strict'

module.exports = require('tracer').colorConsole({
  format: '{{timestamp}} <{{title}}> ({{path}}:{{line}}:{{pos}}:{{method}}) {{message}}',
  dateformat: 'mmm dd HH:MM:ss',
  preprocess: function (data) {
    data.path = data.path.replace(process.cwd(), '')
  }
})
