( function () {
  'use strict';

  if (window.location.pathname !== '/admin') {
    return
  }

  console.log('Hi admin!')

  var p
  var form
  var lock = new Auth0Lock('#{auth0.clientId}', '#{auth0.domain}', {
    allowedConnections: ['facebook'],
    callbackURL:  window.location.origin + '/callback',
    container: 'root',
    rememberLastLogin: false,
    auth: {
      responseType: 'token',
      params: {
        scope: 'openid profile user_groups user_events'
      }
    }
  })

  lock.show({container: 'root'})

  lock.on('show', function() {
    var loginBtn = document.querySelector('.auth0-lock-center')
    form = document.querySelector('.auth0-lock-widget')
    if (p){
      loginBtn.removeChild(form)
    }
  })

  lock.on('authenticated', function(authResult) {
    lock.getProfile(authResult.idToken, function(error, profile) {
      var loginBtn = document.querySelector('.auth0-lock-center');
      p = document.createElement('p')
      loginBtn.appendChild(p)

      if (error) {
        p.style = 'text-align: center; font-size: .9em;'
        p.innerText = 'Error: ' + error
        return
      }

      p.style = 'text-align: center; font-size: .9em; color: MediumSeaGreen;'
      p.innerText = 'Hello ' + profile.name + '!'

      if (form){
        loginBtn.removeChild(form)
      }
    })
  })
})()
