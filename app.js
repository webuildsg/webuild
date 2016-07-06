'use strict'

var express = require('express')
var bodyParser = require('body-parser')
var compress = require('compression')
var errorHandler = require('errorhandler')
var http = require('http')
var path = require('path')
var request = require('request')
var cors = require('cors')
var auth = require('basic-auth')
var bodyParser = require('body-parser');

var cal = require('./lib/cal')
var morgan = require('morgan')
var logger = require('./lib/logger')
var updateLib = require('./lib/update')
var adminLib = require('./lib/admin')

var getConfig = require('./config.js')
var app = express()

app.use(compress())
app.set('view engine', 'pug')
app.use('/public', express.static(path.join(__dirname, '/public')))
app.use('/humans.txt', express.static(path.join(__dirname, '/public/humans.txt')))
app.use('/robots.txt', express.static(path.join(__dirname, '/public/robots.txt')))
app.use(errorHandler())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan(':date[iso] :method :url :status - :response-time ms'))
app.locals.pretty = true
app.locals.moment = require('moment-timezone')

app.get('/apps', function (req, res) {
  res.render('./apps.pug')
})

app.get('/privacy', function (req, res) {
  res.render('./privacy.pug')
})

app.get('/faq', function (req, res) {
  res.render('./faq.pug')
})

app.get('/about', function (req, res) {
  res.render('./about.pug')
})

app.get('/check', function (req, res) {
  res.redirect('/#check')
})

getConfig(function (config) {
  var archives = require('./archives')
  var wbEvents = require('webuild-events')
  var wbRepos = require('webuild-repos')

  var wb = wbEvents.init(config)
  wb.repos = wbRepos.init(config).repos

  app.use(wb.passport.initialize())

  app.get('/', function (req, res) {
    res.render('./index.pug', {
      repos: wb.repos.feed.repos.slice(0, 10),
      events: wb.events.feed.events.slice(0, 10)
    })
  })

  app.post('/api/v1/events/update', function (req, res) {
    getConfig(function (newConfig) {
      config = newConfig
      wb = wbEvents.init(config)
      wb.repos = wbRepos.init(config).repos

      updateLib(req, res, wb, 'events')
    })
  })

  app.post('/api/v1/repos/update', function (req, res) {
    getConfig(function (newConfig) {
      config = newConfig
      wb = wbEvents.init(config)
      wb.repos = wbRepos.init(config).repos

      updateLib(req, res, wb, 'repos')
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
    var credentials = auth(req)

    if (!credentials || credentials.name !== process.env.ADMIN_USERNAME || credentials.pass !== process.env.ADMIN_PASSWORD) {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="webuildsg"')
      res.end('Access denied')
    } else {
      res.render('./admin.pug', {
        auth0: config.auth0,
        error: req.query.error,
        user: req.query.user ? req.query.user : '',
        groups: require('./lib/notApprovedGroups')(wb.events.feed.events, config.whitelistGroups),
        events: wb.events.feed.events.slice(0, 20)
      })
    }
  })

  app.post('/admin', function (req, res) {
    var body = req.body
    var credentials = auth(req)

    if (!credentials || credentials.name !== process.env.ADMIN_USERNAME || credentials.pass !== process.env.ADMIN_PASSWORD) {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="webuildsg"')
      res.end('Access denied')
    } else {
      // Update DB
      if (body.whitelistGroups) {
        adminLib.addToWhitelistGroups(body.whitelistGroups, config.lastIDs)
        config.whitelistGroups = config.whitelistGroups.concat(body.whitelistGroups)
      }

      res.render('./admin.pug', {
        auth0: config.auth0,
        error: req.query.error,
        user: req.query.user ? req.query.user : '',
        groups: require('./lib/notApprovedGroups')(wb.events.feed.events, config.whitelistGroups),
        events: wb.events.feed.events.slice(0, 20)
      })
    }
  })

  app.get('/cal', function (req, res) {
    cal(config, wb.events.feed.events, res)
  })

  app.get('/callback', wb.passport.callback)

  app.post('/api/v1/archives/update', function (req, res) {
    if (req.body.secret !== process.env.WEBUILD_API_SECRET) {
      res.status(503).send('Incorrect secret key')
      return
    }

    var dataOptions = {
      events: wb.events.day,
      repos: wb.repos.day
    }

    archives.init(config).update(dataOptions)
    res.status(200).send('Updating the archives sit tight!')
  })

  app.use('/api/v1/podcasts', cors(), function (req, res) {
    res.setHeader('Cache-Control', 'public, max-age=86400') // 1 day
    request(config.podcastApiUrl, function (err, msg, response) {
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
})
