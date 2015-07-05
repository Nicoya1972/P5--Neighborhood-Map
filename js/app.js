function initialize() {

    var mapOptions = {
        center : { lat: 37.940837, lng: -121.934608},
        zoom: 16
      };

      map = new google.maps.Map(document.getElementById('map-canvas'), 
        mapOptions);
    }
    
    google.maps.event.addDomListener(window, 'load', initialize);
   
    