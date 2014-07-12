var Promise = require('promise');
var GitHubApi = require('github');
var jf = require('jsonfile');
var mess = require('mess');

var LOCATION = process.env.LOCATION || 'Singapore';
var MAX_USERS = process.env.MAX_USERS || 1000;
var MAX_REPOS = process.env.MAX_REPOS || 50;

var github = new GitHubApi({
  version: '3.0.0',
  debug: true
});

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  github.authenticate({
      type: 'oauth',
      key: process.env.GITHUB_CLIENT_ID,
      secret: process.env.GITHUB_CLIENT_SECRET
  });
}

function fetch(method, args, limit) {
  return new Promise(function (resolve, reject) {
    var items = [];
    method(args, function recv(err, res) {
      if (err) {
        if (err.code === 403) {
          console.log('Rate limited');
          setTimeout(function () {
            console.log('Retrying');
            method(args, recv);
          }, 60000);
        } else {
          reject(err);
        }
        return;
      }
      res.items
        .slice(0, limit - items.length)
        .forEach(function (item) {
          items.push(item);
          // console.log(items.length, item);
        });
      if (items.length >= limit || !github.hasNextPage(res)) {
        resolve(items);
      } else {
        github.getNextPage(res, recv);
      }
    });
  });
}

function chunk(arr, size) {
  if (!size > 0) {
    throw Error('Invalid size');
  }
  var chunks = [];
  while (arr.length) {
    chunks.push(arr.splice(0, size));
  }
  return chunks;
}

exports.update = function () {
  console.log('Generating GitHub repos feed... this may take a while...');
  return fetch(github.search.users, {
    q: 'location:' + LOCATION
  }, MAX_USERS)
  .then(function (users) {
    console.log('Found %d users', users.length);
    var searches = chunk(mess(users), 20).map(function (users) {
      return fetch(github.search.repos, {
        sort: 'updated',
        order: 'desc',
        q: users
          .filter(function (user) {
            return !/"/.test(user.login);
          })
          .map(function (user) {
            return 'user:"' + user.login + '"';
          })
          .join('+')
      }, MAX_REPOS);
    });
    return Promise.all(searches);
  })
  .then(function (results) {
    var owners = {};
    return [].concat.apply([], results)
      .map(function (repo) {
        return {
          name: repo.name,
          html_url: repo.html_url,
          description: repo.description,
          updated_at: repo.updated_at,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          owner: {
            login: repo.owner.login,
            avatar_url: repo.owner.avatar_url,
            html_url: repo.owner.html_url
          }
        };
      })
      .sort(function (a, b) {
        return a.updated_at > b.updated_at ? -1 : 1;
      })
      .filter(function (repo) {
        owners[repo.owner.login] = 1 + (owners[repo.owner.login] || 0);
        return owners[repo.owner.login] === 1;
      })
      .slice(0, MAX_REPOS);
  })
  .then(function (repos) {
    console.log('Found %d repos', repos.length);
    jf.writeFile(__dirname + '/public/github.json', {
      generated_at: new Date().toISOString(),
      location: LOCATION,
      max_users: MAX_USERS,
      max_repos: MAX_REPOS,
      repos: repos
    });
  })
  .catch(function (err) {
    console.error(err);
  });
};
