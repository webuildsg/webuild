var express = require('express'),
  bodyParser = require('body-parser'),
  compress = require('compression'),
  cookieParser = require('cookie-parser'),
  errorHandler = require('errorhandler'),
  favicon = require('serve-favicon'),
  http = require('http'),
  moment = require('moment'),
  request = require('request'),
  events = require('./events'),
  passport = require('./events/setup-passport'),
  app = express(),
  podcastApiUrl = 'http://webuildsg.github.io/live/api/podcasts.json'
  repos = require('./repos');

var eventsJson = [];

app.set('port', process.env.PORT || 3000);
app.use(compress());
app.use('/public', express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(errorHandler());
app.locals.pretty = true;
app.locals.moment = require('moment');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(passport.initialize());

function appendHashToEvents(eventsJson, callback) {
  var count = 0;
  eventsJson.forEach(function (eachEvent) {
    eachEvent.hash = '#/' + eachEvent.name.replace(/\s+/g, '-').toLowerCase();
    console.log(eachEvent)

    count++;
    if(count === eventsJson.length) {
      callback(eventsJson);
    }
  });
}

app.get('/', function(req, res) {
  appendHashToEvents(events.feed, function(eventsJson) {
    res.render('index.jade', {
      repos: repos.feed.repos.slice(0, 10),
      events: eventsJson.slice(0, 10)
    });
  })
});

app.get('/api/events', function(req, res) {
  res.send(events.feed);
});

app.get('/api/repos', function(req, res) {
  res.send(repos.feed);
});

app.get('/admin', function(req, res) {
  res.render('facebook_login.jade', {
    auth0: require('./events/config').auth0,
    error: req.query.error ? true : false,
    user: req.query.user ? req.query.user : '',
  });
});

app.get('/callback', function(req, res, next) {
  passport.authenticate('auth0', function(err, user, info) {
    if (err) {
      console.log('Auth0 Error:' + err)
      return next(err); // will generate a 500 error
    } else if (!user) {
      console.log('Unknown user logging with FB');
      return res.redirect('/admin?error=1');
    }
    return res.redirect('/admin?user=' + user.displayName);
  })(req, res, next);
});

app.post('/api/events/update', function(req, res) {
  if (req.param('secret') !== process.env.WEBUILD_API_SECRET) {
    res.send(503, 'Incorrect secret key');
  }
  events.update();
  res.send(200, 'Events feed updating...');
})

app.post('/api/repos/update', function(req, res) {
  if (req.param('secret') !== process.env.WEBUILD_API_SECRET) {
    res.send(503, 'Incorrect secret key');
    return;
  }
  repos.update().then(function(feed) {
    console.log('GitHub feed generated');
  });
  res.send(200, 'Updating the repos feed; sit tight!');
});

app.use('/api/podcasts', function(req, res) {
 var url = podcastApiUrl;
 req.pipe(request(url)).pipe(res);
});

events.update();

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
