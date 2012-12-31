require(
  [
  'jQuery',
  'Fittext',
  'Moment'
  ],
  function($, Fittext, Moment) {

  // Responsive Heading
  $("h1").fitText(0.55).css("opacity", 1);

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
            description: json.data.description
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
      // console.log('inside sortByDate');
      // console.log(this.totalList);
    },
    insertRepo: function (  ) {
      var arr = this.totalList;

      for( var arrayIndex = 0; arrayIndex < arr.length; arrayIndex++ ) {
        // console.log(arr[arrayIndex]);
        $("ul.open-list.second li:nth-child(" + (arrayIndex + 1) + ")").html(
          '<a href="'+
          arr[arrayIndex].html_url +
          '"><p>' +
          arr[arrayIndex].name +
          '<span>updated ' +
          moment(arr[arrayIndex].pushed_at).endOf('hour').fromNow() +
          '</span></p><p class="tagline" >' +
          arr[arrayIndex].description +
          '</p></a>'
        );
      }
    }
  };

  // Non Github Repo
  Repo.totalList.push({
    html_url: "http://www.sketchkit.com/",
    name: "Sketch Kit Wireframes",
    pushed_at: "2012-10-01",
    description: "Create quick iPhone app wireframes in Keynote"
  });

  // Github Repo
  Repo.fetch([
    'miccheng/php-queue',
    'MugunthKumar/MKNetworkKit',
    'lxcid/LXReorderableCollectionViewFlowLayout',
    'Luracast/Restler',
    'honcheng/PaperFold-for-iOS',
    'cheeaun/hackerweb',
    'MugunthKumar/MKStoreKit',
    'zz85/sparks.js',
    'uzyn/opauth',
    'hboon/GlassButtons',
    'petejkim/specta'
    ]);

});