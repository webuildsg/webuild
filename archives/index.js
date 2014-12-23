var Github = require('github-api'),
  github,
  filename = '',
  repo = '',
  data = ''
  contents = '',
  message = '';

github = new Github({
  type: 'oauth',
  token: 'secret'
});

repo = github.getRepo('webuildsg', 'test');

filename = 'events/events_archive_2014_12_30_HHMMSS.json'
data = {
  hello: 'hola!!'
}
contents = JSON.stringify(data)
message = 'data: events archive 2014-12-30'

repo.write('master', filename, contents, message, function(err) {
  console.log('done!');
});
