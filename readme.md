# We Build SG
[![Dependency Status](https://img.shields.io/gemnasium/webuildsg/webuild.svg)](https://gemnasium.com/webuildsg/webuild) [![Build Status](https://img.shields.io/travis/webuildsg/webuild/master.svg)](https://travis-ci.org/webuildsg/webuild) [![Code Climate](https://codeclimate.com/github/webuildsg/webuild/badges/gpa.svg)](https://codeclimate.com/github/webuildsg/webuild) [![Coverage Status](https://img.shields.io/coveralls/webuildsg/webuild.svg)](https://coveralls.io/r/webuildsg/webuild) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/webuildsg/webuild?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> [We Build SG](http://webuild.sg/) automatically curates a list of free public developer / design events from [Facebook](https://developers.facebook.com/docs/graph-api/reference/v2.0/group/events) / [Meetup](http://www.meetup.com/meetup_api/docs/2/event/#get) / [Eventbrite](http://developer.eventbrite.com/doc/events/event_search/) / ICS url / manual and open source projects from  [Github](https://developer.github.com/v3/) for the curious folks who love to make things in a particular city.

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
2. Setup environment variables. Refer [Environment Variables](#environment-variables) section for more details.

	```sh
	cp .env.sample .env
	```
3. Start the website locally with `./run.sh`

## Background

**Repositories curated automatically every hour:**

1. Github repositories
	- user location contains `Singapore`
	- repos with more than 50 watchers
	- repos pushed date less than 3 months ago

**Events curated automatically every hour:**

1. Facebook [selected groups](config/facebookGroups.json)
2. Meetup.com / Eventbrite event category `Technology`, free, has a valid location
3. ICS url
4. Manually added events

## API endpoints

The events, repositories and podcasts data feeds are available in public as JSON format. Please refer to the [list of API endpoints](https://api.webuild.sg/)

## Archived data

A daily snapshot of the [repos](https://webuild.sg/api/v1/repos) and [events](https://webuild.sg/api/v1/events) API V1 endpoints are stored in the [archives](https://github.com/webuildsg/data) for  data analysis at [data.webuild.sg](https://data.webuild.sg).

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

### Firebase related environment variables

1. Open a [Firebase account](https://www.firebase.com/)
2. Create a new app for this project
3. Under `Login & Auth` > `Registered Users` > `Add User`
4. Note the email, password, user uid and firebase unique app url for the following variables:
	- **FIREBASE_EMAIL** (required): .   
	- **FIREBASE_PASSWORD** (required)
	- **FIREBASE_UID** (required)
	- **FIREBASE_URL** (required)

## Contribute

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Versioning

Every production code has a version following the [Semantic Versioning guidelines](http://semver.org/). Run the `grunt bump`, `grunt bump:minor` or `grunt bump:major` command to bump the version accordingly and then push to production with `git push production master`.

## License

We Build is released under the [MIT License](http://opensource.org/licenses/MIT).
