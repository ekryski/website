var Site = {
  markers: [
    [-114.063096, 51.044473],
    [126.978220, 37.564828],
    [126.525458, 33.501368],
    [-0.123915, 51.509628],
    [4.894668, 52.370628],
    [4.407795, 51.220529],
    [-0.364333, 49.174495],
    [-155.997126, 19.657635],
    [-86.850173, 21.161950],
    [-9.155540, 38.760701],
    [-5.969505, 37.385631],
    [1.248513, 41.127138],
    [2.171365, 41.391419],
    [-87.626069, 41.877972],
    [11.582519, 48.134866],
    [11.434393, 48.263618],
    [9.182195, 48.780252],
    [6.973943, 50.946821],
    [4.348211, 50.863684],
    [9.184438, 45.466117],
    [7.265692, 43.696365],
    [5.364284, 43.296135],
    [1.450404, 43.598729],
    [-0.576573, 44.838768],
    [2.356776, 48.859688],
    [-81.382826, 28.536982],
    [-73.966674, 40.780284],
    [-123.085967, 49.311958],
    [-71.243419, 46.804689],
    [-97.138835, 49.899621],
    [-106.681574, 52.133438],
    [-119.498265, 49.910085],
    [-87.913528, 43.038071],
    [-122.678798, 45.522475],
    [-157.860940, 21.307119],
    [-117.426398, 47.658852]
  ],

  init: function(){
    this.$modal = $('.player-modal');
    this.$triangles = $('.triangle');

    this.seenProjects = false;

    // Event bindings
    $(window).on('scroll', $.proxy(this.checkWaypoints, this));
    $('a.play').click($.proxy(this.playVideo, this));
    $('a.close').click($.proxy(this.stopVideo, this));
    $('a.show-travels').click($.proxy(this.startTraveling, this));
    $('.triangle a').mouseenter(this.toggleExpansion);
    $('.triangle a').mouseleave(this.toggleExpansion);

    this.startCounting();
    this.insertMap();
  },

  checkWaypoints: function(){
    var position = window.pageYOffset;

    if ( !this.seenProjects && (position > $('section.projects').offset().top - 100) ) {
      this.seenProjects = true;
      this.highlightHexagon();
    }
  },

  startCounting: function(){
    $('.counter').counterUp({
        delay: 10,
        time: 1500
    });
  },

  toggleExpansion: function(ev){
    $(this).parent().toggleClass('active expanded');
  },

  highlightHexagon: function(){
    var self = this;
    var order = [
      'top',
      'top-right',
      'bottom-right',
      'bottom',
      'bottom-left',
      'top-left'
    ];

    setTimeout(function() {
      self.$triangles.removeClass('expanded');
    }, 500);

    setTimeout(function() {
      self.$triangles.each(function(index, triangle){
        setTimeout(function() {
          self.$triangles.removeClass('active');
          $('.triangle.' + order[index]).addClass('active');
        }, 200 * index);

        setTimeout(function() {
          self.$triangles.removeClass('active');
        }, 200 * (self.$triangles.length + 1));
      });
    }, 800);
  },

  playVideo: function(event){
    event.preventDefault();

    this.$modal.removeClass('hidden');
    this.$modal.find('#player').html('<iframe class="video" width="560" height="315" src="//www.youtube.com/embed/ThFCg0tBDck?rel=0&vq=hd720&autoplay=1" frameborder="0" allowfullscreen></iframe>');
  },

  stopVideo: function(event){
    event.preventDefault();

    this.$modal.find('#player').empty();
    this.$modal.addClass('hidden');
  },

  insertMap: function(){
    var self = this;

    this.map = L.mapbox.map('map', 'ekryski.i0naei2f')
        .setView([51.044473, -114.063096], 12);

    this.plotMarkers();

    this.map.featureLayer.on('click', function(e) {
        self.map.panTo(e.layer.getLatLng());
    });
  },

  plotMarkers: function(){
    for (var i = 0; i < this.markers.length; i++) {

      var marker = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: this.markers[i]
        },
        properties: {
          'marker-size': 'medium',
          'marker-color': '#E25667',
          'marker-symbol': 'star'
        }
      };

      L.mapbox.featureLayer(marker).addTo(this.map);
    }
  },

  startTraveling: function(){
    this.map.panTo({
      lat: 48.859688,
      lng: 2.356776
    });

    this.map.setZoom(2);
  }
};

$(document).ready(function(){
    Site.init();
});