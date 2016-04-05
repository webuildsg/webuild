'use strict'

var express = require('express')
var bodyParser = require('body-parser')
var compress = require('compression')
var errorHandler = require('errorhandler')
var http = require('http')
var moment = require('moment-timezone')
var path = require('path')
var request = require('request')
var cors = require('cors')

var clc = require('cli-color')
var cal = require('./lib/cal')
var morgan = require('morgan')
var logger = require('./lib/logger')
var updateLib = require('./lib/update')

var config = require('./config.js')
var wb = require('webuild-events').init(config)
wb.repos = require('webuild-repos').init(config).repos
var archives = require('./archives').init(config)
var podcastApiUrl = config.podcastApiUrl
var whitelistGroups = require('./config/whitelistGroups')

var app = express()

app.use(compress())
app.use('/public', express.static(path.join(__dirname, '/public')))
app.use('/humans.txt', express.static(path.join(__dirname, '/public/humans.txt')))
app.use('/robots.txt', express.static(path.join(__dirname, '/public/robots.txt')))
app.use(errorHandler())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(wb.passport.initialize())
app.use(morgan('tiny'))
app.locals.pretty = true
app.locals.moment = require('moment-timezone')

app.get('/', function (req, res) {
  res.render('./index.jade', {
    repos: wb.repos.feed.repos.slice(0, 10),
    events: wb.events.feed.events.slice(0, 10)
  })
})

app.get('/api/v1/check/:checkdate', cors(), function (req, res) {
  var clashedEvents = require('./lib/clashedEvents')
  res.send(clashedEvents(req.params.checkdate, config, wb.events.feed.events))
})

app.get('/api/v1/events', cors(), function (req, res) {
  return req.query.n ? res.send(wb.events.get(req.query.n)) : res.send(wb.events.feed)
})

app.get('/api/v1/events/day', cors(), function (req, res) {
  res.send(wb.events.day)
})

app.get('/api/v1/events/hour', cors(), function (req, res) {
  res.send(wb.events.hour)
})

app.get('/api/v1/repos', cors(), function (req, res) {
  return req.query.n ? res.send(wb.repos.get(req.query.n)) : res.send(wb.repos.feed)
})

app.get('/api/v1/repos/day', cors(), function (req, res) {
  res.send(wb.repos.day)
})

app.get('/api/v1/repos/hour', cors(), function (req, res) {
  res.send(wb.repos.hour)
})

app.get('/api/v1/repos/:language', cors(), function (req, res) {
  var reposWithLanguage = require('./lib/reposWithLanguage')(req.params, config, wb.repos)
  res.send(reposWithLanguage)
})

app.get('/admin', function (req, res) {
  res.render('./admin.jade', {
    auth0: config.auth0,
    error: req.query.error,
    user: req.query.user ? req.query.user : '',
    groups: require('./lib/notApprovedGroups')(wb.events.feed.events, whitelistGroups)
  })
})

app.get('/apps', function (req, res) {
  res.render('./apps.jade')
})

app.get('/cal', function (req, res) {
  cal(config, wb.events.feed.events, res)
})

app.get('/check', function (req, res) {
  res.redirect('/#check')
})

app.get('/callback', wb.passport.callback)

app.post('/api/v1/events/update', function (req, res) {
  updateLib(req, res, wb, 'events')
})

app.post('/api/v1/repos/update', function (req, res) {
  updateLib(req, res, wb, 'events')
})

app.post('/api/v1/archives/update', function (req, res) {
  if (req.param('secret') !== process.env.WEBUILD_API_SECRET) {
    res.status(503).send('Incorrect secret key')
    return
  }
  archives.update()
  res.status(200).send('Updating the archives sit tight!')
})

app.use('/api/v1/podcasts', cors(), function (req, res) {
  res.setHeader('Cache-Control', 'public, max-age=86400') // 1 day
  request(podcastApiUrl, function (err, msg, response) {
    if (err) {
      res.status(503).send('We Build Live Error')
      return
    }

    res.end(response)
  })
})

app.use(function (req, res) {
  res.redirect('/')
})

var ip = process.env.NODE_IP || process.env.OPENSHIFT_NODE4_IP || '0.0.0.0'
var port = process.env.NODE_PORT || process.env.OPENSHIFT_NODE4_PORT || process.env.PORT || 3000

http.createServer(app).listen(port, ip, function () {
  logger.trace(`Express server started at ${ip}:${port}`)
})
