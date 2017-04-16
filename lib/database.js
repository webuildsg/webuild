var firebase = require('firebase-admin')
var crypto = require('crypto')

function decrypt (encrypted) {
  var decipher = crypto.createDecipheriv(algorithm, password, iv)
  decipher.setAuthTag(encrypted.tag)
  var dec = decipher.update(encrypted.content, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}

var algorithm = 'aes-256-gcm'
var password = process.env.FIREBASE_PASSWORD
var iv = process.env.FIREBASE_IV

var encryptedPrivateKey = require('../private.enc.json')
encryptedPrivateKey.tag = Buffer.from(encryptedPrivateKey.tag.data)

var decryptedPrivateKey = JSON.parse(decrypt(encryptedPrivateKey))

firebase.initializeApp({
  credential: firebase.credential.cert(decryptedPrivateKey),
  databaseURL: 'https://webuildsg.firebaseio.com'
})

module.exports = firebase.database().ref('/')
