var firebase = require('firebase')
var logger = require('./logger')

// Initialize the app with a service account, granting admin privileges

var serviceAccountCredentials = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY,
  "client_email": "firebase-service-account@" + process.env.FIREBASE_PROJECT_ID + ".iam.gserviceaccount.com",
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-service-account%40" + process.env.FIREBASE_PROJECT_ID + ".iam.gserviceaccount.com"
}

firebase.initializeApp({
    databaseURL: process.env.FIREBASE_URL,
    serviceAccount: serviceAccountCredentials
});

module.exports = firebase.database().ref('/');
