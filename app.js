var express = require('express')
  //, mongoose = require('mongoose')
  , http = require('http');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 4000);
  app.use('/public/css', express.static(__dirname + '/public/css'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
});

app.get("/", function(req, res) {
  res.render("index.jade", { name: 'Sayanee'});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
