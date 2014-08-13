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
  repos = require('./repos'),
  ical = require('ical-generator'),
  newrelic = require('newrelic'),
  cal = ical();

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
app.locals.moment = require('moment');

app.get('/', function(req, res) {
  res.render('index.jade', {
    repos: repos.feed.repos.slice(0, 10),
    events: events.feed.slice(0, 10)
  });
});

app.get('/api/check/:checkdate', function(req, res) {
  var checkdate = moment(req.params.checkdate, 'DD-MM-YYYY') ,
    clashedEvents = [];

  clashedEvents = events.feed.filter(function(element) {
    if (moment(element.start_time).isSame(checkdate, 'day') ) {
      return true;
    }
  });

  res.send(clashedEvents);

})

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

app.get('/cal', function(req, res) {
  cal.clear()
  cal.setDomain('webuild.sg').setName('We Build SG Events');

  events.feed.filter(function(thisEvent){
    if (!(thisEvent.start_time && thisEvent.end_time && thisEvent.name && thisEvent.description)){
      console.log("Not enough information on this event", thisEvent.name, thisEvent.start_time, thisEvent.end_time, thisEvent.description);
    }
    return thisEvent.start_time && thisEvent.end_time && thisEvent.name && thisEvent.description
  }).forEach(function(thisEvent) {
      cal.addEvent({
        start: new Date(thisEvent.start_time),
        end: new Date(thisEvent.end_time),
        summary: thisEvent.name + ' by ' + thisEvent.group_name,
        description: thisEvent.description,
        location: thisEvent.location || 'Singapore',
        url: thisEvent.url || thisEvent.group_url
      });
  });
  cal.serve(res);

});

app.get('/check', function(req, res) {
  res.redirect('/#check');
})

app.get('/callback', passport.callback);

app.post('/api/events/update', function(req, res) {
  if (req.param('secret') !== process.env.WEBUILD_API_SECRET) {
    res.status(503).send('Incorrect secret key');
    return;
  }
  events.update();
  res.status(200).send('Events feed updating...');
})

app.post('/api/repos/update', function(req, res) {
  if (req.param('secret') !== process.env.WEBUILD_API_SECRET) {
    res.status(503).send('Incorrect secret key');
    return;
  }
  repos.update().then(function(feed) {
    console.log('GitHub feed generated');
  });
  res.status(200).send('Updating the repos feed; sit tight!');
});

app.use('/api/podcasts', function(req, res) {
 var url = podcastApiUrl;
 res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
 request(url, function(err, msg, response){
  if (err) {
    res.status(503).send('We Build Live Error');
    return;
  }
  res.end(response);
 })
});

app.use(function(req, res, next){
  res.redirect('/');
  return;
});

events.update();
repos.update();

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
