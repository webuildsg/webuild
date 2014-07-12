var express = require('express'),
  fs = require('fs'),
  http = require('http'),
  app = express(),
  later = require('later'),
  request = require('request'),
  jf = require('jsonfile'),
  moment = require('moment'),
  githubFeed = require('./jobs/github_feed');

app.configure(function(){
  app.set('port', process.env.PORT || 4000);
  app.use('/public', express.static(__dirname + '/public'));
  app.use(express.favicon(__dirname + '/public/favicon.ico'));

  app.use(express.errorHandler());
  app.locals.pretty = true;
  app.locals.moment = require('moment');

  app.use(express.bodyParser());
  app.use(express.methodOverride());
});

var githubJson = { repos: [] };

app.get("/", function(req, res) {
  res.render("index.jade", {
    github: githubJson
  });
});

app.post("/feeds/github/update", function(req, res) {
  if (req.param('secret') === process.env.WEBUILD_API_SECRET) {
    githubFeed.update()
      .then(function(feed) {
        console.log('GitHub feed generated');
        githubJson = feed;
        jf.writeFile(__dirname + '/github.json', feed);
      });
    res.send(200, 'Updating the repos feed; sit tight!');
  }
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

later.setInterval(githubFeed.update, later.parse.text('every 1 hour'));

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
