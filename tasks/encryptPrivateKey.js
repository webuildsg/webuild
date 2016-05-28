var fs = require('fs');

var crypto = require('crypto')
var algorithm = 'aes-256-gcm'
var password = process.env.FIREBASE_PASSWORD
var iv = process.env.FIREBASE_IV

function encrypt(text) {
  var cipher = crypto.createCipheriv(algorithm, password, iv)
  var encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex');
  var tag = cipher.getAuthTag();
  return {
    content: encrypted,
    tag: tag
  };
}

fs.readFile('private.json', 'utf8', function(err, data) {
    if (err) throw err;
    fs.writeFile('private.enc.json', JSON.stringify(encrypt(data)), 'utf8', function(err) {
        if (err) throw err;
    });
});
