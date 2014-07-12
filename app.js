var express = require('express'),
  http = require('http'),
  moment = require('moment'),
  app = express(),
  events = require('./events')
  moreEvents = require('./events/more_events');

app.configure(function(){
  app.set('port', process.env.PORT || 4000);
  app.use('/public', express.static(__dirname + '/public'));
  app.use(express.favicon(__dirname + '/public/favicon.ico'));

  app.use(express.errorHandler());
  app.locals.pretty = true;

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

app.get('/', function(req, res) {
  res.render("index.jade", { name: 'Sayanee'});
});

app.get('/api/events', function(req, res) {
  events.getMeetupEvents()
  .then(function(data) {
    var eventsList = data.concat(moreEvents);
    eventsList.sort(timeComparer);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(eventsList));
  })
  .catch(function(err) {
    console.error(err);
    res.end('[]');
  })
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
