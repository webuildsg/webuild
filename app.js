'use strict'

var express = require('express')
var bodyParser = require('body-parser')
var compress = require('compression')
var errorHandler = require('errorhandler')
var http = require('http')
var path = require('path')
var request = require('request')
var cors = require('cors')

var cal = require('./lib/cal')
var morgan = require('morgan')
var logger = require('./lib/logger')
var adminLib = require('./lib/admin')
var cleanupLib = require('./lib/cleanup')
var notApprovedGroupsLib = require('./lib/notApprovedGroups')
var countdownLib = require('./lib/countdown')

var getConfig = require('./config.js')
var app = express()

var archives = require('./archives')
var backups = require('./backups')
var wbEvents = require('webuild-events')
var wbRepos = require('webuild-repos')

var wb = {}

app.use(compress())
app.set('view engine', 'pug')
app.use('/public', express.static(path.join(__dirname, '/public')))
app.use('/data.csv', express.static(path.join(__dirname, '/public/data.csv')))
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

app.get('/techstack', function (req, res) {
  res.render('./techstack.pug')
})

getConfig(function (config) {
  ({ events: wb.events, passport: wb.passport } = wbEvents.init(config))

  wb.repos = wbRepos.init(config).repos

  // Update on start
  wb.events.update()
  wb.repos.update()

  app.use(wb.passport.initialize())

  app.get('/', function (req, res) {
    request(config.podcastApiUrl, function (err, msg, response) {
      var podcastTime
      var countdownTime

      if (!err) {
        try {
          podcastTime = JSON.parse(response).meta.next_live_show.start_time
          countdownTime = countdownLib(config, podcastTime)
        }catch (e){}

      }

      res.render('./index.pug', {
        repos: wb.repos && wb.repos.feed && wb.repos.feed.repos ? wb.repos.feed.repos.slice(0, 10) : [],
        events: wb.events && wb.events.feed && wb.events.feed.events ? wb.events.feed.events.slice(0, 10) : [],
        countdownTime: countdownTime
      })
    })
  })

  // Event
  app.post('/api/v1/events/update', function (req, res) {
    if (req.body.secret !== process.env.WEBUILD_API_SECRET) {
      res.status(503).send('Incorrect secret key')
      return
    }

    getConfig(function (newConfig) {
      config = newConfig
      wb.events = wbEvents.init(config).events
      wb.events.update()
    })

    var message = 'Updating the event feed sit tight!'
    logger.trace(message)
    res.status(200).send(message)
  })

  app.delete('/api/v1/events/cleanup', function (req, res) {
    if (req.body.secret !== process.env.WEBUILD_API_SECRET) {
      res.status(503).send('Incorrect secret key')
      return
    }

    cleanupLib(config.originalDB, function (error, reply) {
      if (error) {
        res.status(200).send(error)
      } else {
        res.status(200).send(reply)
      }
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

  app.get('/cal', function (req, res) {
    cal(config, wb.events.feed.events, res)
  })

  // Repos
  app.post('/api/v1/repos/update', function (req, res) {
    if (req.body.secret !== process.env.WEBUILD_API_SECRET) {
      res.status(503).send('Incorrect secret key')
      return
    }

    getConfig(function (newConfig) {
      config = newConfig
      wb.repos = wbRepos.init(config).repos
      wb.repos.update()
    })

    var message = 'Updating the repos feed sit tight!'
    logger.trace(message)
    res.status(200).send(message)
  })

  app.get('/api/v1/repos', cors(), function (req, res) {
    if (wb.repos && wb.repos.feed){
      return req.query.n ? res.send(wb.repos.get(req.query.n)) : res.send(wb.repos.feed)
    }else {
      res.send(503)
    }
  })

  app.get('/api/v1/repos/day', cors(), function (req, res) {
    if (wb.repos && wb.repos.day){
      res.send(wb.repos.day)
    }else {
      res.send(503)
    }
  })

  app.get('/api/v1/repos/hour', cors(), function (req, res) {
    if (wb.repos && wb.repos.hour){
      res.send(wb.repos.hour)
    }else {
      res.send(503)
    }

  })

  app.get('/api/v1/repos/:language', cors(), function (req, res) {
    var reposWithLanguage = require('./lib/reposWithLanguage')(req.params, config, wb.repos)
    res.send(reposWithLanguage)
  })

  // Admin

  app.get('/admin', function (req, res) {
    if (!adminLib.isAdmin(req)) {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="webuildsg"')
      res.end('Access denied')
    } else {
      res.render('./admin.pug', {
        auth0: config.auth0,
        groups: notApprovedGroupsLib(wb.events.feed.events, config.whitelistGroups),
        events: wb.events.feed.events.slice(0, 20)
      })
    }
  })

  app.post('/admin', function (req, res) {
    var body = req.body
    var blacklistGroupPlatforms = [ 'eventbrite', 'meetup' ]

    if (!adminLib.isAdmin(req) || !adminLib.isValidOrigin(req)) {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="webuildsg"')
      res.end('Access denied')
    } else {
      if (body.whitelistGroups) { // white list groups
        adminLib.addToWhitelistGroups(body.whitelistGroups)
        config.whitelistGroups = config.whitelistGroups.concat(body.whitelistGroups)
      }

      if (body.blacklistEvents) { // black list events
        adminLib.addToBlacklistEvents(body.blacklistEvents)
        config.blacklistEvents = config.blacklistEvents.concat(body.blacklistEvents)

        wb.events.feed.events = wb.events.feed.events.filter(function (eachEvent) {
          var count = 0

          body.blacklistEvents.forEach(function (eachBlacklistEvent) {
            if (eachEvent.id.toString() === eachBlacklistEvent.id.toString()) {
              count++
            }
          })

          return count === 0
        })
      }

      blacklistGroupPlatforms.forEach(function (eachPlatform) {
        if (body[ eachPlatform ]) {
          adminLib.addToBlacklistGroups(body[ eachPlatform ], eachPlatform)
          wb.events.feed.events = adminLib.removeBlacklistGroupEvents(wb.events.feed.events, body[ eachPlatform ], eachPlatform)
        }
      })

      res.redirect('/admin')
    }
  })

  app.post('/add', function (req, res) {
    var body = req.body

    if (!adminLib.isAdmin(req) || !adminLib.isValidOrigin(req)) {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="webuildsg"')
      res.end('Access denied')
    } else {
      adminLib.addToWhitelistEvents(body)

      res.redirect('/admin')
    }
  })

  app.get('/callback', wb.passport.callback)

  // Archives

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

  app.post('/api/v1/backups/update', function (req, res) {
    if (req.body.secret !== process.env.WEBUILD_API_SECRET) {
      res.status(503).send('Incorrect secret key')
      return
    }

    backups(config.archives, config.originalDB)
    res.status(200).send('Backing up the Firebase db. Sit tight!')
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
    logger.trace(`Express server started at http://${ip}:${port}`)
  })
})
