var express = require('express'),
  fs = require('fs'),
  http = require('http'),
  moment = require('moment'),
  events = require('./events'),
  moreEvents = require('./events/whitelistEvents'),
  request = require('request'),
  jf = require('jsonfile'),
  githubFeed = require('./repos/github_feed'),
  passport = require('passport'),
  strategy = require('./events/setup-passport'),
  ghConfig = require('./repos/config.js'),
  app = express(),
  podcastApiUrl = "http://live.webuild.sg/api/podcasts.json";

var githubJson = { repos: [] },
  eventsJson = [];

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.compress());
  app.use('/public', express.static(__dirname + '/public'));
  app.use(express.favicon(__dirname + '/public/favicon.ico'));

  app.use(express.errorHandler());
  app.locals.pretty = true;
  app.locals.moment = require('moment');

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'webuild_session' + new Date().toISOString()}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

function timeComparer(a, b) {
  return (moment(a.formatted_time, events.timeFormat).valueOf() -
          moment(b.formatted_time, events.timeFormat).valueOf());
}

function updateEventsJson() {
  console.log('Updating the events feed...');
  return events.getMeetupEvents()
  .then(function(data) {
    console.log(data)
    eventsJson = data.concat(moreEvents);
    eventsJson.sort(timeComparer);
    console.log(eventsJson.length + ' events have been added!');
  })
  .catch(function(err) {
    console.error('Failed to update events feeds: ' + err);
  })
}

app.get('/', function(req, res) {
  res.render('index.jade', {
    github: githubJson.repos.slice(0, 10),
    events: eventsJson.slice(0, 10)
  });
});

app.get('/admin', function(req, res) {
  res.render('facebook_login.jade');
});

app.get('/api/events', function(req, res) {
  console.log(JSON.stringify(req.user));
  res.send(eventsJson);
});

app.get('/api/github', function(req, res) {
  res.send(githubJson);
});

app.get('/api/users', function(req, res) {
  events.getUsers();
})

app.get('/callback', passport.authenticate('auth0', {
    failureRedirect: '/admin'
  }), function(req, res) {
    res.redirect('/');
  }
);

app.post('/api/events/update', function(req, res) {
  if (req.param('secret') !== process.env.WEBUILD_API_SECRET) {
    res.send(503, 'Incorrect secret key');
  }
  updateEventsJson()
  .then(function() {
    res.send(200, 'Events feed updated');
  })
  .catch(function() {
    res.send(500, 'Failed to update feed');
  });
})

app.post('/api/repos/update', function(req, res) {
  if (req.param('secret') !== process.env.WEBUILD_API_SECRET) {
    res.send(503, 'Incorrect secret key');
    return;
  }
  githubFeed.update()
    .then(function(feed) {
      console.log('GitHub feed generated');
      githubJson = feed;
      jf.writeFile(__dirname + ghConfig.outfile, feed);
    });
  res.send(200, 'Updating the repos feed; sit tight!');
});

app.use('/api/podcasts', function(req, res) {
 var url = podcastApiUrl;
 req.pipe(request(url)).pipe(res);
});

fs.exists(__dirname + ghConfig.outfile, function(exists) {
  if (exists) {
    jf.readFile(__dirname + ghConfig.outfile, function(err, feed) {
      if (!err) {
        githubJson = feed;
      }
    });
  } else {
    console.log('Fetching public repos feed...');
    request('http://webuild.sg/repos.json', function(err, res, body) {
      if (!err && res.statusCode === 200) {
        console.log('Cached public repos feed');
        githubJson = body;
        jf.writeFile(__dirname + ghConfig.outfile, body);
      } else {
        if (res) {
          console.warn('Failed to retrieve data (Status code: %s)', res.statusCode);
        }
        else {
          console.warn('Failed to retrieve data (Status code: %s)', err);
        }
      }
    });
  }
});
updateEventsJson();

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
