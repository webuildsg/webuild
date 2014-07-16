[![Dependency Status](https://gemnasium.com/sayanee/webuild.png)](https://gemnasium.com/sayanee/webuild)

[![Build Status](https://travis-ci.org/webuildsg/webuild.png)](https://travis-ci.org/webuildsg/webuild)

[We Build SG](http://www.webuild.sg/) curates a list of free public events and open source projects for the curious folks who love to make things in Singapore!


Who are we? We are **techies** - developers, designers, programmers, hackers or makers.

- **veteran techies** to get introduced to the community of open events and open source
- **wannabe techies** to get examples of great open source projects and  events to meet mentors
- **traveling techies** to drop by and connect with the local ones
- **existing techies** to keep connecting, mentoring and growing the open community

**Open Events** are *free tech events* that are open for public and anyone can drop by.

**Open Source** are projects with [free licenses](http://en.wikipedia.org/wiki/Comparison_of_free_software_licences).


#Websites

- [Main](http://www.webuild.sg/)
- [Production](http://webuildsg.herokuapp.com/)
- [Staging](http://webuildsg-dev.herokuapp.com/)
- [Github Repo](https://github.com/webuildsg/webuild)
- [Twitter](https://twitter.com/webuildsg)
- [Facebook](https://www.facebook.com/webuildsg)

#API

The events, repositories and podcasts data feeds are available as JSON.

- <http://webuild.sg/api/repos>
- <http://webuild.sg/api/events>
- <http://webuild.sg/api/podcasts>


#Install

1. clone the app

	```
	git@github.com:webuildsg/webuild.git
	```
1. install package

	```
	npm install
	bower install
	``` 
1. build frontend css and javascript files with grunt

	```
	grunt
	```
1. run in command line `node app.js`
1. open [localhost:4000](http://localhost:4000/)



#Deployment

Set the following environment variables on your system:

- **WEBUILD_API_SECRET** (required) Used as a password when remotely refreshing the feeds.
- [**MEETUP_API_KEY**](https://secure.meetup.com/meetup_api/key/) (required) Used to list available meetup events in Singapore.
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

# Listed events and repos

###events

1. Meetup and Facebook events in Singapore are automatically populated
1. **White list events**: To add additional events, edit `events/whitelistEvents.json`
1. **Black list events**: To remove a specific events (paid / duplicate), get the event `id` from <http://webuild.sg/api/events> endpoint and edit `events/blacklistEvents.json`

###repos

1. Github repos from user's location Singapore are automatically populated
1. Repos with more than 200 watchers and pushed date less than 3 months ago are selected
1. **White list users**: To add additional users, edit `repos/whitelistUsers.json`


#Compile CSS

To compile sass into css and minify:

- open folder `app/public/css`
- run in command line `sass --compass --watch style.sass:style.css --style compressed`