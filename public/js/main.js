require(
  [
  'jQuery',
  'Moment'
  ],
  function($, Moment) {

  // hello to another happy developer
  console.log('hello fellow developer :)');
  console.log('if you have suggestions for this site, do buzz me and say hi @sayanee_');

  // Github API call for Repos
  var Repo = {
    totalList: [],
    fetch: function(config) {
      var len = config.length,
      self = this,
      count = 0;
      config.forEach( function(configEl) {
        var url = 'https://api.github.com/repos/' + configEl + '?callback=?';
        $.getJSON( url, function( json ) {
          var repo = {
            html_url: json.data.html_url,
            name: json.data.name,
            pushed_at: json.data.pushed_at,
            description: json.data.description,
            stars: json.data.watchers_count
          };
          self.totalList.push(repo);
          count++;
          if (count === len) {
            self.sortByDate();
            self.insertRepo();
          }
        });
      });
    },
    sortHelper: function(field, reverse, primer){
      var key = function (x) {
        return primer ? primer(x[field]) : x[field];
      };
      return function (a,b) {
        var A = key(a), B = key(b);
        if ( A < B ) {
          return -1 * [-1,1][+!!reverse];
        } else if ( A > B ) {
          return +1 * [-1,1][+!!reverse];
        } else {
          return 0 * [-1,1][+!!reverse];
        }
      };
    },
    sortByDate: function () {
      // console.log(this.totalList);
      this.totalList.sort(
        this.sortHelper('pushed_at', false, function(a) {
          return new Date(a);
        })
        );
    },
    insertRepo: function (  ) {
      var arr = this.totalList;

      for( var arrayIndex = 0; arrayIndex < arr.length; arrayIndex++ ) {
        $("ul.open-list.second li:nth-child(" + (arrayIndex + 1) + ")").html(
          '<a href="'+
          arr[arrayIndex].html_url +
          '"><p>' +
          arr[arrayIndex].name +
          '<span>updated ' +
          moment(arr[arrayIndex].pushed_at).endOf('hour').fromNow() +
          '</span><span class="stars">&#9733; ' +
          arr[arrayIndex].stars +
          '</span></p><p class="tagline" >' +
          arr[arrayIndex].description +
          '</p></a>'
          );
      }
    }
  };

  // click live section to go to the live website
  $('.live').click(function() {
    window.parent.location.href = 'http://live.webuild.sg';
  });

  // countdown
  countdown();
  setInterval(countdown, 1000);
  function countdown () {
    var now = moment(),
    podcastDate = "2014-08-02 11:00 +0800",
    dateFormat = "YYYY-MM-DD HH:mm Z",
    livedate = moment(podcastDate, dateFormat),
    then = moment(podcastDate, dateFormat);

    ms = then.diff(now, 'milliseconds', true);
    days = Math.floor(moment.duration(ms).asDays());

    if (days >= 0) {
      then.subtract('days', days);
      ms = then.diff(now, 'milliseconds', true);
      hours = Math.floor(moment.duration(ms).asHours());

      then.subtract('hours', hours);
      ms = then.diff(now, 'milliseconds', true);
      minutes = Math.floor(moment.duration(ms).asMinutes());

      then.subtract('minutes', minutes);
      ms = then.diff(now, 'milliseconds', true);
      seconds = Math.floor(moment.duration(ms).asSeconds());

      diff = 'in <strong>' + days + '</strong> days <strong>' + hours + '</strong> hours <strong>' + minutes + '</strong> minutes <strong>' + seconds + '</strong> seconds';

      $('.countdown').html(diff);
      $('#livetime').html( livedate.format('D MMM YYYY, ddd @h:mm a Z' ) + ' GMT' );
    } else {
      $('.countdown').html('');
    }


  }

  // Non Github Repo
  // Repo.totalList.push({
  //   html_url: "http://www.sketchkit.com/",
  //   name: "Sketch Kit Wireframes",
  //   pushed_at: "2012-10-01",
  //   description: "Create quick iPhone app wireframes in Keynote"
  // });

  // Github Repo updated in the last 2 months
  Repo.fetch([
    'lxcid/LXReorderableCollectionViewFlowLayout',
    'cheeaun/hackerweb',
    'specta/specta',
    'Luracast/Restler',
    'MugunthKumar/MKNetworkKit',
    'opauth/opauth',
    'jf/rbenv-gemset',
    // 'MugunthKumar/MKStoreKit',
    // 'honcheng/PaperFold-for-iOS',
    'laktek/punch',
    // 'laktek/jQuery-Smart-Auto-Complete',
    'CoderKungfu/php-queue',
    'cheeaun/life',
    'winston/google_visualr',
    'timoxley/functional-javascript-workshop'
    // 'zz85/sparks.js'
    // 'honcheng/RTLabel',
    // 'mbrochh/vim-as-a-python-ide'
    // 'honcheng/PaperFoldMenuController',
    // 'hboon/GlassButtons',
    ]);

});
