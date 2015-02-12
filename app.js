'use strict';

require('newrelic');

var express = require('express');
var bodyParser = require('body-parser');
var compress = require('compression');
var errorHandler = require('errorhandler');
var favicon = require('serve-favicon');
var http = require('http');
var moment = require('moment-timezone');
var request = require('request');
var ical = require('ical-generator');
var clc = require('cli-color');

var events = require('./events');
var archives = require('./archives');
var countdown = require('./countdown');
var repos = require('./repos');
var passport = require('./events/setup-passport');

var app = express();
var podcastApiUrl = 'http://webuildsg.github.io/live/api/v1/podcasts.json';
var cal = ical();

app.set('port', process.env.PORT || 3000);

app.use(compress());
app.use('/public', express.static(__dirname + '/public'));
app.use('/humans.txt', express.static(__dirname + '/public/humans.txt'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(errorHandler());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(passport.initialize());

app.locals.pretty = true;
app.locals.moment = require('moment-timezone');

app.get('/', function(req, res) {
  countdown.calculateCountdown();
  res.render('index.jade', {
    formattedTime: countdown.formattedTime,
    days: countdown.days,
    hours: countdown.hours,
    minutes: countdown.minutes,
    seconds: countdown.seconds,
    repos: repos.feed.repos.slice(0, 10),
    events: events.feed.events.slice(0, 10)
  });
});

app.get('/api/v1/check/:checkdate', function(req, res) {
  var checkdate = moment(req.params.checkdate, 'YYYY-MM-DD');
  var clashedEvents = {
    'meta': {
      'generated_at': new Date().toISOString(),
      'location': 'Singapore',
      'api_version': 'v1'
    },
    'events': []
  };

  clashedEvents.events = events.feed.events.filter(function(element) {
    if (moment(element.start_time).isSame(checkdate, 'day') ) {
      return true;
    }
  });

  clashedEvents.meta.total_events = clashedEvents.events.length;

  res.send(clashedEvents);

})

app.get('/api/v1/events', function(req, res) {
  res.send(events.feed);
});

app.get('/api/v1/repos', function(req, res) {
  res.send(repos.feed);
});

app.get('/admin', function(req, res) {
  res.render('facebook_login.jade', {
    auth0: require('./events/config').auth0,
    error: req.query.error ? true : false,
    user: req.query.user ? req.query.user : ''
  });
});

app.get('/cal', function(req, res) {
  cal.clear()
  cal.setDomain('webuild.sg').setName('We Build SG Events');

  events.feed.events.filter(function(thisEvent) {
    if (!(thisEvent.start_time && thisEvent.end_time && thisEvent.name && thisEvent.description)) {
      console.log('Not enough information on this event', thisEvent.name, thisEvent.start_time, thisEvent.end_time, thisEvent.description);
    }
    return thisEvent.start_time && thisEvent.end_time && thisEvent.name && thisEvent.description
  }).forEach(function(thisEvent) {
      cal.addEvent({
        start: new Date(thisEvent.start_time),
        end: new Date(thisEvent.end_time),
        summary: thisEvent.name + ' by ' + thisEvent.group_name,
        description: thisEvent.description + ' \n\nEvent URL: ' + thisEvent.url || thisEvent.group_url,
        location: thisEvent.location || 'Singapore',
        url: thisEvent.url || thisEvent.group_url
      });
  });

  // add next We Build LIVE show dat
  request(podcastApiUrl, function(err, msg, response) {
    if (err) {
     console.error(clc.red('Error: Fetching We Build Live podcast api'));
     return;
    }
    response = JSON.parse(response);
    cal.addEvent({
      start: new Date(response.meta.next_live_show.start_time),
      end: new Date(response.meta.next_live_show.end_time),
      summary: response.meta.next_live_show.summary,
      description: response.meta.next_live_show.description + ' \n\nEvent URL: ' + response.meta.next_live_show.url,
      location: 'Singapore',
      url: response.meta.next_live_show.url
    });
    cal.serve(res);
  });

});

app.get('/check', function(req, res) {
  res.redirect('/#check');
})

app.get('/callback', passport.callback);

app.post('/api/v1/events/update', function(req, res) {
  if (req.param('secret') !== process.env.WEBUILD_API_SECRET) {
    res.status(503).send('Incorrect secret key');
    return;
  }
  events.update();
  res.status(200).send('Events feed updating...');
})

app.post('/api/v1/repos/update', function(req, res) {
  if (req.param('secret') !== process.env.WEBUILD_API_SECRET) {
    res.status(503).send('Incorrect secret key');
    return;
  }
  repos.update().then(function() {
    console.log('GitHub feed generated');
  });
  res.status(200).send('Updating the repos feed; sit tight!');
});

app.post('/api/v1/archives/update', function(req, res) {
  if (req.param('secret') !== process.env.WEBUILD_API_SECRET) {
    res.status(503).send('Incorrect secret key');
    return;
  }
  archives.update();
  res.status(200).send('Updating the archives; sit tight!');

})

app.use('/api/v1/podcasts', function(req, res) {
 var url = podcastApiUrl;
 res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
 request(url, function(err, msg, response) {
  if (err) {
    res.status(503).send('We Build Live Error');
    return;
  }
  res.end(response);
 })
});

app.use(function(req, res) {
  res.redirect('/');
  return;
});

events.update();
repos.update();
countdown.update();

http.createServer(app).listen(app.get('port'), function() {
  console.log(clc.black('Express server started at http://localhost:' + app.get('port')));
});
