var express = require('express'),
  fs = require('fs'),
  http = require('http'),
  moment = require('moment'),
  events = require('./events')
  moreEvents = require('./events/more_events'),
  request = require('request'),
  jf = require('jsonfile'),
  githubFeed = require('./jobs/github_feed'),
  app = express();

var githubJson = { repos: [] },
  eventsJson = [];

app.configure(function(){
  app.set('port', process.env.PORT || 4000);
  app.use(express.compress());
  app.use('/public', express.static(__dirname + '/public'));
  app.use(express.favicon(__dirname + '/public/favicon.ico'));

  app.use(express.errorHandler());
  app.locals.pretty = true;
  app.locals.moment = require('moment');

  app.use(express.bodyParser());
  app.use(express.methodOverride());
});

function timeComparer(a, b) {
  function momentcast(x) {
    return x.time ? moment(new Date(x.time))
                  : moment(x.formatted_time, 'DD MMM, ddd, h:mm a');
  }
  return (momentcast(a).valueOf() - momentcast(b).valueOf());
}

function updateEventsJson() {
  console.log('Updating the events feed...');
  return events.getMeetupEvents()
  .then(function(events) {
    eventsJson = events.concat(moreEvents);
    eventsJson.sort(timeComparer);
    console.log('The events feed has been updated!');
  })
  .catch(function(err) {
    console.error(err);
  })
}

app.get('/', function(req, res) {
  res.render('index.jade', {
    github: githubJson,
    events: eventsJson
  });
});

app.get('/api/events', function(req, res) {
  res.send(eventsJson);
});

app.get('/api/github', function(req, res) {
  res.send(githubJson);
});

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

app.post('/api/github/update', function(req, res) {
  if (req.param('secret') !== process.env.WEBUILD_API_SECRET) {
    res.send(503, 'Incorrect secret key');
  }
  githubFeed.update()
    .then(function(feed) {
      console.log('GitHub feed generated');
      githubJson = feed;
      jf.writeFile(__dirname + '/github.json', feed);
    });
  res.send(200, 'Updating the repos feed; sit tight!');
});

fs.exists(__dirname + '/github.json', function(exists) {
  if (exists) {
    jf.readFile(__dirname + '/github.json', function(err, feed) {
      if (!err) {
        githubJson = feed;
      }
    });
  } else {
    console.log('Fetching public repos feed...');
    request('http://webuild.sg/github.json', function(err, res, body) {
      if (!err && res.statusCode === 200) {
        console.log('Cached public repos feed');
        githubJson = body;
        jf.writeFile(__dirname + '/github.json', body);
      } else {
        console.warn('Failed to retrieve data (Status code: %s)', res.statusCode);
      }
    });
  }
});
updateEventsJson();

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
