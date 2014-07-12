var express = require('express'),
  http = require('http'),
  app = express(),
  later = require('later'),
  githubFeed = require('./jobs/github_feed');

app.configure(function(){
  app.set('port', process.env.PORT || 4000);
  app.use('/public', express.static(__dirname + '/public'));
  app.use(express.favicon(__dirname + '/public/favicon.ico'));

  app.use(express.errorHandler());
  app.locals.pretty = true;

  app.use(express.bodyParser());
  app.use(express.methodOverride());
});

app.get("/", function(req, res) {
  res.render("index.jade", { name: 'Sayanee'});
});

githubFeed();
later.setInterval(githubFeed, later.parse.text('every 1 hour'));

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
