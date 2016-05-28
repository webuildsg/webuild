var firebase = require('firebase')
var logger = require('./logger')
var crypto = require('crypto')


function decrypt(encrypted) {
  var decipher = crypto.createDecipheriv(algorithm, password, iv)
  decipher.setAuthTag(encrypted.tag);
  var dec = decipher.update(encrypted.content, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}


var algorithm = 'aes-256-gcm'
var password = process.env.FIREBASE_PASSWORD
var iv = process.env.FIREBASE_IV

// This is what we will do in the app
var encryptedPrivateKey = require('../private.enc.json');
encryptedPrivateKey.tag = new Buffer(encryptedPrivateKey.tag.data);

var decryptedPrivateKey = JSON.parse(decrypt(encryptedPrivateKey));

firebase.initializeApp({
    databaseURL: process.env.FIREBASE_URL,
    serviceAccount: decryptedPrivateKey
});

module.exports = firebase.database().ref('/');
