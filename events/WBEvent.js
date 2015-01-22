'use strict';

function WBEvent(options) {

  this.id = 0;
  this.name = null;
  this.description = null;
  this.location = null;
  this.url = null;
  this.group_name = null;
  this.group_url = null;
  this.formatted_time = null;
  this.start_time = null;
  this.end_time = null;

  options = options || {};
  for (var prop in options) {
    if (options.hasOwnProperty(prop)) {
      this[ prop ] = options[ prop ];
    }
  }

}

module.exports = WBEvent;
