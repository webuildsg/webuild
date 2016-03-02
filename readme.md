# We Build SG
[![Dependency Status](https://img.shields.io/gemnasium/webuildsg/webuild.svg)](https://gemnasium.com/webuildsg/webuild) [![Build Status](https://img.shields.io/travis/webuildsg/webuild/master.svg)](https://travis-ci.org/webuildsg/webuild) [![Code Climate](https://codeclimate.com/github/webuildsg/webuild/badges/gpa.svg)](https://codeclimate.com/github/webuildsg/webuild) [![Coverage Status](https://img.shields.io/coveralls/webuildsg/webuild.svg)](https://coveralls.io/r/webuildsg/webuild) [![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/webuildsg/webuild?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> [We Build SG](http://webuild.sg/) automatically curates a list of free public developer / design events from [Facebook](https://developers.facebook.com/docs/graph-api/reference/v2.0/group/events) / [Meetup](http://www.meetup.com/meetup_api/docs/2/event/#get) / [Eventbrite](http://developer.eventbrite.com/doc/events/event_search/) / ICS url / manual and open source projects from  [Github](https://developer.github.com/v3/) for the curious folks who love to make things in a particular city.

> This repository is an example for Singapore.

## Quick start

1. clone this project and install dependancies:

	```sh
git clone git@github.com:webuildsg/webuild.git && cd webuild
gem install foreman thor tmuxinator
gem install dotenv -v 0.11.1
gem install dotenv-deployment -v 0.0.2
npm install -g bower grunt-cli
npm i && bower install
	```
- Setup environment variables. Refer [Environment Variables](#environment-variables) section for more details.

	```sh
	cp .env-example .env
	```
- Start the website locally with `./run.sh`

## Background

**Repositories curated automatically every hour:**

1. Github repositories
- user location contains `Singapore`
- repos with more than 50 watchers
- repos pushed date less than 3 months ago

**Events curated automatically every hour:**

1. Facebook [selected groups](config/facebookGroups.json)
- Meetup.com / Eventbrite event category `Technology`, free, has a valid location
- ICS url
- Manually added events

## API endpoints

The events, repositories and podcasts data feeds are available as JSON.

- <https://webuild.sg/api/v1/repos>
- <https://webuild.sg/api/v1/repos/day>
- <https://webuild.sg/api/v1/repos/hour>
- <https://webuild.sg/api/v1/repos?n=2>
- <https://webuild.sg/api/v1/repos/:language>
- <https://webuild.sg/api/v1/events>
- <https://webuild.sg/api/v1/events/day>
- <https://webuild.sg/api/v1/events/hour>
- -<https://webuild.sg/api/v1/events?n=2>
- <https://webuild.sg/api/v1/podcasts>
- `https://webuild.sg/api/v1/check/:checkdate` where `checkdate` is in the format `YYYY-MM-DD` to check for clashed events with `checkdate`

## Archived data

A daily snapshot of the [repos](https://webuild.sg/api/v1/repos) and [events](https://webuild.sg/api/v1/events) API V1 endpoints are stored in the [archives](https://github.com/webuildsg/data) for  data analaysis at [data.webuild.sg](https://data.webuild.sg).

## Deploy

You can deploy this app to 3 different platforms:

1. [Open Shift](https://www.openshift.com/)
- [Heroku](https://heroku.com)
- Bluemix

### Deploy to Open Shift

We are using [Open Shift](https://www.openshift.com/) for production.

These are the steps for deploying:

1. create an application with folder `.openshift` with various Open Shift related configurations
- [install client tools](https://developers.openshift.com/en/getting-started-osx.html#client-tools) with `gem install rhc`
- setup the app with `rhc setup`
- create an app using [cartridge](https://github.com/connyay/openshift-iojs#usage) - note the `GIT_REMOTE_URL`
- to ssh into your gear, use `rhc ssh {APP_NAME}`
- add the cron cratridge with `rhc cartridge add cron -a {APP_NAME}`
- set environment variables with

  ```sh
  rhc env-set BOT_TOKEN={secret} EVENTBRITE_TOKEN={secret} GITHUB_CLIENT_ID={secret} GITHUB_CLIENT_SECRET={secret} MEETUP_API_KEY={secret} NODE_ENV={APP_NAME} TZ=Asia/Singapore WEBUILD_API_SECRET={secret} WEBUILD_AUTH0_CLIENT_ID={secret} WEBUILD_AUTH0_CLIENT_SECRET={secret} --app {APP_NAME}
  ```
- add a git remote to the git config, so you can push your code to the gear

  ```sh
  [remote "{APP_NAME}"]
    url = {GIT_REMOTE_URL}
    fetch = +refs/heads/*:refs/remotes/{APP_NAME}/*
  ```
- create a [build file](https://github.com/connyay/express-openshift-iojs/blob/master/.openshift/action_hooks/build) in path `.openshift/action_hooks/build` for your app (if you're forking webuildsg, this is already inside the repo)
- make sure the build file permissions for is executable `chmod +x .openshift/action_hooks/build`
- push the app `git push {APP_NAME} master --force`
- check if the app website is up
- if you need to restart the app use `rhc app-restart {APP_NAME}`
- to see app info use `rhc app-show {APP_NAME} -v`
- to check out the logs from the app use `rhc tail {APP_NAME}`

### Deploy to Heroku

These are the steps for deploying:

1. Install [Heroku command line](https://devcenter.heroku.com/articles/heroku-command)
- Create [new Heroku app](https://devcenter.heroku.com/articles/creating-apps) for [NodeJS](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- Setup the following [environment variables](#environment-variables) under the Heroku app settings:

	```sh
	BOT_TOKEN=secret
	EVENTBRITE_TOKEN=secret
	GITHUB_CLIENT_ID=secret
	GITHUB_CLIENT_SECRET=secret
	MEETUP_API_KEY=secret
	NODE_ENV=production
	TZ=Asia/Singapore
	WEBUILD_API_SECRET=secret
	WEBUILD_AUTH0_CLIENT_ID=secret
	WEBUILD_AUTH0_CLIENT_SECRET=secret
	```
- Get [Heroku Scheduler](https://addons-sso.heroku.com/apps/webuildsg-dev/addons/scheduler:standard) add on and add 2 tasks with an hourly frequency:
	- update events every hour

		```sh
		curl -X POST --data "secret=<WEBUILD_API_SECRET>" <your_production_url>/api/v1/events/update
		```
	- update repos every hour

		```sh
		curl -X POST --data "secret=<WEBUILD_API_SECRET>" <your_production_url>/api/v1/repos/update
		```
	- store to archives repos and events every day

		```sh
		curl -X POST --data "secret=<WEBUILD_API_SECRET>" <your_production_url>/api/v1/archives/update
		```

### Deploy to Bluemix

These are the steps for deploying:

1. Install [Cloud Foundry CLI](https://github.com/cloudfoundry/cli/releases)
- Create the manifest.yml file in the root directory. Modify the name, host and env for your application:

	```yaml
	---
	applications:
	- name: webuild
	  host: webuild
	  domain: mybluemix.net
	  buildpack: sdk-for-nodejs
	  command: node app.js
	  path: .
	  memory: 512M
	  stack: cflinuxfs2
	  env:
	  	BOT_TOKEN: secret
	    EVENTBRITE_TOKEN: secret
	    GITHUB_CLIENT_ID: secret
	    GITHUB_CLIENT_SECRET: secret
	    MEETUP_API_KEY: secret
	    NODE_ENV: production
	    TZ: Asia/Singapore
	    WEBUILD_API_SECRET: secret
	    WEBUILD_AUTH0_CLIENT_ID: secret
	    WEBUILD_AUTH0_CLIENT_SECRET: secret
	```
- Create the app on Bluemix

	```sh
	cf push
	```
- Setup the cron job with OpenWhisk (experimental): TODO

## Environment variables

Set the following environment variables on your system:

- **WEBUILD_API_SECRET** (required) Used as a password when remotely refreshing the feeds.
- [**MEETUP_API_KEY**](https://secure.meetup.com/meetup_api/key/) (required) Used to list available meetup events in Singapore.
- [**EVENTBRITE_TOKEN**](http://developer.eventbrite.com/) (required) Used to list available eventbrite events in Singapore.
- **WEBUILD_AUTH0_CLIENT_ID** (required): Used to retrive facebook events in Singapore. Auth0 takes care of OAuth2 social logins.
- **WEBUILD_AUTH0_CLIENT_SECRET** (required): Same as above.
- **PORT** (optional, default: 4000) Configures the port used by the web server.
- **LOCATION** (optional, default: Singapore) The GitHub feed shows only repositories owned by developers in this area. Matches the GitHub "Location" property in user profiles.
- **MAX_USERS** (optional, default: 1000) Show only repositories belonging to developers in this ranking. Only the last updated repository of a user is shown.
- **MAX_REPOS** (optional, default: 50) Show up to this many total repositories.
- **GITHUB_CLIENT_ID** (optional) App OAuth client ID for GitHub.
- **GITHUB_CLIENT_SECRET** (optional) App OAuth client secret for GitHub.
- **NODE_ENV** Environment variable. By default it is `staging` and for production it is `production`
- **BOT_TOKEN** This token is used by the [We Build SG Bot](https://github.com/webuildsg-bot) to store the api endpoint responses for [repos](https://webuild.sg/api/v1/repos) and [events](https://webuild.sg/api/v1/events) to the [archives](https://github.com/webuildsg/archives) every day. [Generate a token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/) for the Github user [We Build SG Bot](https://github.com/webuildsg-bot).

Use an external "web cron" service to periodically refresh the GitHub data feed. Keep in mind that due to GitHub API rate limiting it may take >15 minutes to retrieve the entire feed. [Register a GitHub OAuth application](https://github.com/settings/applications/new) and configure the `GITHUB_CLIENT_*` environment variables (see above) to increase the rate limit. Do not refresh the feed too often or the rate limit will cause it to take longer.

Create an [Auth0](https://auth0.com/) account (you get one free app) and a Facebook app and link them with [these instructions](https://docs.auth0.com/facebook-clientid). Configure the `WEBUILD_AUTH0_CLIENT_*` environment variables (see above) and add your callback url in auth0. Run the app and if all is configured well, add your fb aceess token by logging in at `<localhost>/admin`

## Editing events list

- Add events:
	1. Add manual events in file `config/whitelistEvents.json`
	- Add a Facebook groups with [Facebook group ID](http://lookup-id.com) in file `config/facebookGroups.json`
	- Add an `*.ics` format URL in file `config/icsGroups.json`
- Remove events:
	- Remove paid / duplicate events in file `config/blacklistEvents.json`
	- Remove Meetup.com group by adding the `group_id` in file `config/meetupBlacklistGroups.json`
- Cleanup old events manually in files `events/whitelistEvents.json` and `events/blacklistEvents.json` with `grunt cleanup`

## Contribute

Please see `CONTRIBUTING.md` for details.

## Versioning

Every production code has a version following the [Semantic Versioning guidelines](http://semver.org/). Run the `grunt bump`, `grunt bump:minor` or `grunt bump:major` command to bump the version accordingly and then push to production with `git push production master`.

## License

We Build is released under the [MIT License](http://opensource.org/licenses/MIT).
