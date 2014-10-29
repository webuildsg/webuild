'use strict';

var expect = require('chai').expect,
  countdown = require('../../countdown'),
  moment = require('moment-timezone');

describe('Countdown', function() {

  it('returns formatted time', function(done) {
    countdown.liveDateResponse = '2014-11-01 11:00 +0800';

    expect(countdown.calculateCountdown).to.not.throw(Error);
    expect(countdown.formattedTime).to.equal('1 Nov 2014, Sat @11:00 am +08:00 GMT');
    done();
  });

  it('returns days, hours, minutes, seconds', function(done) {
    countdown.liveDateResponse = '2014-11-01 11:00 +0800';

    expect(function() {
      countdown.calculateCountdown(moment('2014-10-21 23:48:33 GMT+0800', 'YYYY-MM-DD HH:mm:ss Z'));
    }).to.not.throw(Error);
    expect(countdown.days).to.equal(10);
    expect(countdown.hours).to.equal(11);
    expect(countdown.minutes).to.equal(11);
    expect(countdown.seconds).to.equal(27);
    done();
  });
});

