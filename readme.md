[![Dependency Status](https://gemnasium.com/webuildsg/webuild.png)](https://gemnasium.com/webuildsg/webuild) [![Build Status](https://travis-ci.org/webuildsg/webuild.png)](https://travis-ci.org/webuildsg/webuild)

[We Build SG](http://webuild.sg/) automatically curates a list of free public events ([Facebook](https://developers.facebook.com/docs/graph-api/reference/v2.0/group/events) / [Meetup](http://www.meetup.com/meetup_api/docs/2/event/#get) / manual) and open source projects ([Github](https://developer.github.com/v3/) / manual) for the curious folks who love to make things in a particular city. This repository is an example for Singapore.

###**Please feel free to fork this for your choice of city/country too :smile:**


Who are we? We are **techies** - developers, designers, programmers, hackers or makers. And we want to connect various techies to come together and connect:

- **veteran techies** to get introduced to the community of open events and open source
- **wannabe techies** to get examples of great open source projects and  events to meet mentors
- **traveling techies** to drop by and connect with the local ones
- **existing techies** to keep connecting, mentoring and growing the open community

**Open Events** are free events that are open for public and anyone can drop by.

**Open Source** are projects with [free licenses](http://en.wikipedia.org/wiki/Comparison_of_free_software_licences).


#Websites

- [Main](http://www.webuild.sg/)
- [Production](http://webuildsg.herokuapp.com/) in [Heroku](http://heroku.com/)
- [Staging](http://webuildsg-dev.herokuapp.com/) in [Heroku](http://heroku.com/)
- [Github Repo](https://github.com/webuildsg/webuild)
- [Twitter](https://twitter.com/webuildsg)
- [Facebook](https://www.facebook.com/webuildsg)

#API

The events, repositories and podcasts data feeds are available as JSON.

- <http://webuild.sg/api/repos>
- <http://webuild.sg/api/events>
- <http://webuild.sg/api/podcasts>
- `http://webuild.sg/api/check/:checkdate` where `checkdate` is in the format `DD-MM-YYYY` to check for clashed events with `checkdate`


#Install for development

Chose either one of the 2 ways:

##1. Nitrous.IO / Your Host

1. Clone this repo either with [Nitrous.IO](http://nitrous.io/) or in your local machine.
	1. Use [Nitrous.IO](https://www.nitrous.io/?utm_source=github.com&utm_campaign=Life&utm_medium=hackonnitrous) to create your own *We Build* in seconds:

		[![Hack webuildsg/webuild on Nitrous.IO](https://d3o0mnbgv6k92a.cloudfront.net/assets/hack-l-v1-3cc067e71372f6045e1949af9d96095b.png)](https://www.nitrous.io/hack_button?source=embed&runtime=nodejs&repo=webuildsg%2Fwebuild&file_to_open=README.md)
	1. Clone the app:

		```
		git clone git@github.com:webuildsg/webuild.git
		cd webuild
		```

1. Setup the necessary environment variables. Refer [Environment Variables](#environment-variables) section for more details.

	```
	cp .env-example .env
	```

1. Install required packages with [npm](https://www.npmjs.org/) and [RubyGems](https://rubygems.org/).

	```
	gem install sass compass
	npm install -g bower
	npm install -g grunt-cli
	npm install
	bower install
	```
1. Build frontend css and javascript files, along with other tasks with [grunt](http://gruntjs.com/)

	```
	grunt
	```
1. Run in command line `./run.sh` to start the app.
1. Open [localhost:4000](http://localhost:4000/) in your browser.
1. Run the following command in another terminal to update events and repos:

	```
	./update.sh
	```

##2. Using Docker

1. Clone this repo

	```
	git clone git@github.com:webuildsg/webuild.git
	cd webuild
	```

1. Setup the necessary environment variables. Refer [Environment Variables](#environment-variables) section for more details.

	 ```
	 cp .env-example .env
	 ```

1. Build with [Docker](http://docker.com/)

	```
	docker build -t webuild .
	```
1. run docker with port mapping

	```
	docker run -i -t -p 4000:4000 webuild
	```
1. Open `<DOCKER_HOST>:4000` in your host browser e.g. `http://localhost:4000/`

1. Run the following command in another terminal to update events and repos:

	```
	./update.sh
	```

#Deploy to production

We used [Heroku](http://heroku.com/) - thank you! These are the steps we took to deploy:

1. Install [Heroku command line](https://devcenter.heroku.com/articles/heroku-command)
1. Create [new Heroku app](https://devcenter.heroku.com/articles/creating-apps) for [NodeJS](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
1. Setup the following [environment variables](#environment-variables) under the Heroku app settings:

	```
	GITHUB_CLIENT_ID
	GITHUB_CLIENT_SECRET
	MEETUP_API_KEY
	PATH
	WEBUILD_API_SECRET
	WEBUILD_AUTH0_CLIENT_ID
	WEBUILD_AUTH0_CLIENT_SECRET
	```
1. Get [Heroku Scheduler](https://addons-sso.heroku.com/apps/webuildsg-dev/addons/scheduler:standard) add on and add 2 tasks with an hourly frequency:

	- update events every hour

		```
		curl -X POST --data "secret=<WEBUILD_API_SECRET>" <your_production_url>/api/events/update
		```
	- update repos every hour

		```
		curl -X POST --data "secret=<WEBUILD_API_SECRET>" <your_production_url>/api/repos/update
		```


#Environment variables

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

Use an external "web cron" service to periodically refresh the GitHub data feed. Keep in mind that due to GitHub API rate limiting it may take >15 minutes to retrieve the entire feed. [Register a GitHub OAuth application](https://github.com/settings/applications/new) and configure the `GITHUB_CLIENT_*` environment variables (see above) to increase the rate limit. Do not refresh the feed too often or the rate limit will cause it to take longer.

Create an [Auth0](https://auth0.com/) account (you get one free app) and a Facebook app and link them with [these instructions](https://docs.auth0.com/facebook-clientid). Configure the `WEBUILD_AUTH0_CLIENT_*` environment variables (see above) and add your callback url in auth0. Run the app and if all is configured well, add your fb aceess token by logging in at `<localhost>/admin`

###Newrelic

If you are integrating Newrelic for analytics, the following environment variables are required:

- **NEW_RELIC_APDEX** (required, default: 0.010)
- **NEW_RELIC_APP_NAME** (required): Use the Heroku app name
- **NEW_RELIC_LICENSE_KEY** (required): Newrelic license key will be given upon creating a new application

# Editing events and repos list

###Events

1. Meetup, Eventbrite and Facebook events in Singapore are automatically populated.
1. **White list events**: To add more events, edit `events/whitelistEvents.json`.
1. **Black list events**: To remove a specific events (paid / duplicate), get the event `id` from <http://webuild.sg/api/events> endpoint and add to `events/blacklistEvents.json`.
1. **Facebook groups**: To automatically retrive facebook events from a facebook group or page, its `id` and `name` must be added in `events/facebookGroups.json`. Your list of facebook groups can be obtain with the FB Graph API `me/groups` endpoint. Go to <https://developers.facebook.com/tools/explorer/?method=GET&path=me%2Fgroups&version=v2.1>, get an access_token with `user_groups` permissions and submit. Do the same for facebook pages with `me/likes` endpoint. Alternatively, you may use <http://lookup-id.com/> to find a facebook group id.
1. **Eventbrite categories**: To automatically find events in an Eventbrite category, add the `id` from this list: <http://developer.eventbrite.com/docs/event-categories/>

###Repos

1. Github repos from user's location Singapore are automatically populated.
1. Repos with more than 200 watchers and pushed date less than 3 months ago are selected.
1. **White list users**: To add more users, edit `repos/whitelistUsers.json`.

#Customise for any location

**Events**

1. `/events/config.js` - basic config for automatically fetching Meetup events
1. `/events/facebookGroups.json` - list of facebook groups you want to automatically query to fetch their upcoming events
1. `/events/blacklistEvents.json` - events you might want to remove based on the event `id` found in the api endpoint `/api/events`
1. `/events/whitelistEvents.json` - manually add in an event not fetched automatically

**Repos**

1. `/repos/config.js` - basic config for automatically fetching Github repositories
1. `/repos/whitelistUsers.json` - manually add in usernames from Github if they are not included in the automatic query

#Contribute

Please see `CONTRIBUTING.md` for details.

#Versioning

Every production code has a version following the [Semantic Versioning guidelines](http://semver.org/). Run the `grunt bump` command to bump the version accordingly and then push to production with `git push production master`.

#License

We Build is released under the [MIT License](http://opensource.org/licenses/MIT).
