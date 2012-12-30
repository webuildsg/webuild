(function( $ ){

  $.fn.fitText = function( kompressor, options ) {

    // Setup options
    var compressor = kompressor || 1,
        settings = $.extend({
          'minFontSize' : Number.NEGATIVE_INFINITY,
          'maxFontSize' : Number.POSITIVE_INFINITY
        }, options);

    return this.each(function(){

      // Store the object
      var $this = $(this);

      // Resizer() resizes items based on the object width divided by the compressor * 10
      var resizer = function () {
        $this.css('font-size', Math.max(Math.min($this.width() / (compressor*10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
      };

      // Call once to set.
      resizer();

      // Call on resize. Opera debounces their resize by default.
      $(window).on('resize', resizer);

    });

  };

})( jQuery );

$(document).ready(function() {
  $("h1").fitText(0.55).css("opacity", 1);
});

function insertRepo(num, url, name, updated, description) {
  $("ul.open-list.second li:nth-child(" + num + ")").html(
    '<a href="' + url + '"><p>' + name + '<span>updated ' + moment(updated).endOf('hour').fromNow() +
    '</span></p><p class="tagline" >' + description + '</p></a>');
}
$.getJSON("https://api.github.com/repos/miccheng/php-queue?callback=?", function(json) {
  insertRepo(1, json.data.html_url, json.data.name, json.data.pushed_at, json.data.description);
});
$.getJSON("https://api.github.com/repos/MugunthKumar/MKNetworkKit?callback=?", function(json) {
  insertRepo(2, json.data.html_url, json.data.name, json.data.pushed_at, json.data.description);
});
$.getJSON("https://api.github.com/repos/Luracast/Restler?callback=?", function(json) {
  insertRepo(3, json.data.html_url, json.data.name, json.data.pushed_at, json.data.description);
});
$.getJSON("https://api.github.com/repos/lxcid/LXReorderableCollectionViewFlowLayout?callback=?", function(json) {
  insertRepo(4, json.data.html_url, json.data.name, json.data.pushed_at, json.data.description);
});
$.getJSON("https://api.github.com/repos/honcheng/PaperFold-for-iOS?callback=?", function(json) {
  insertRepo(5, json.data.html_url, json.data.name, json.data.pushed_at, json.data.description);
});
$.getJSON("https://api.github.com/repos/cheeaun/hackerweb?callback=?", function(json) {
  insertRepo(6, json.data.html_url, json.data.name, json.data.pushed_at, json.data.description);
});
$.getJSON("https://api.github.com/repos/MugunthKumar/MKStoreKit?callback=?", function(json) {
  insertRepo(7, json.data.html_url, json.data.name, json.data.pushed_at, json.data.description);
});
$.getJSON("https://api.github.com/repos/zz85/sparks.js?callback=?", function(json) {
  insertRepo(8, json.data.html_url, json.data.name, json.data.pushed_at, json.data.description);
});
$.getJSON("https://api.github.com/repos/uzyn/opauth?callback=?", function(json) {
  insertRepo(9, json.data.html_url, json.data.name, json.data.pushed_at, json.data.description);
});
$.getJSON("https://api.github.com/repos/hboon/GlassButtons?callback=?", function(json) {
  insertRepo(10, json.data.html_url, json.data.name, json.data.pushed_at, json.data.description);
});
insertRepo(11, "http://www.sketchkit.com/", "Sketch Kit Wireframes", "2012-09-30", "Create quick iPhone app wireframes in Keynote");
$.getJSON("https://api.github.com/repos/petejkim/specta?callback=?", function(json) {
  insertRepo(12, json.data.html_url, json.data.name, json.data.pushed_at, json.data.description);
});