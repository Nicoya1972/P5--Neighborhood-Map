var locations = [{
    id: '0',
    name: 'Moresi\'s Chop House',
    latIngA: 37.941477,
    latIngB: -121.934626,
    address: '6115 Main St, Clayton, CA 94517',
    description: 'Where is the Beef'
}, {
    id: '1',
    name: 'La Veranda Cafe',
    latIngA: 37.940694,
    latIngB: -121.933255,
    address: '6201 Center St, Clayton, CA 94517',
    description: 'Italian Dining'
}, {
    id: '2',
    name: 'Ed\'s Mudville Grill',
    latIngA: 37.940305,
    latIngB: -121.933186,
    address: '6200 Center St, Clayton, CA 94517',
    description: 'Beer anyone'
}, {
    id: '3',
    name: 'Skipolini\'s Pizza',
    latIngA: 37.941048,
    latIngB: -121.936035,
    address: '1035 Diablo St, Clayton, CA 94517',
    description: 'When the Moon hits you eye like a big pice of Pie...... '
}, {
    id: '4',
    name: 'Clayton Club Saloon',
    latIngA: 37.941134,
    latIngB: -121.934996,
    address: '6096 Main St, Clayton, CA 94517',
    description: "Jack Daniel\'s lives here"
}, {
    id: '5',
    name: 'Johnny\'s International Deli and Cafe',
    latIngA: 37.940710,
    latIngB: -121.934705,
    address: '6101 Center St, Clayton, CA 94517',
    description: 'Sanwiched Time'
}, {
    id: '6',
    name: 'Oakhust Country Club',
    latIngA: 37.943967,
    latIngB: -121.928021,
    address: '1001 Peacock Creek Dr, Clayton, CA 94517',
    description: 'Happy Gilmore'
}, {
    id: '7',
    name: 'Library',
    latIngA: 37.942550,
    latIngB: -121.935326,
    address: '6125 Clayton Rd, Clayton, CA 94517',
    description: 'Shhhhh Learning taking Place'
}, {
    id: '8',
    name: 'The Grove',
    latIngA: 37.940757,
    latIngB: -121.934017,
    address: '6100 Main St, Clayton, CA 94517',
    description: "It\'s a Groove thing"
}, {
    id: '9',
    name: 'Clayton City Hall',
    latIngA: 37.942415,
    latIngB: -121.937268,
    address: '6000 Heritage Trail, Clayton, CA 94517',
    description: 'Where the Law lives'
}];

    
var ViewModel = function() {
    "use strict";
    var self = this;

    var view = new View();

    // Initialize the array for list view. This array will contain the list of locations for rendering
    self.locationList = ko.observableArray();

    // Initialize locations on the map
    self.initialize = function() {
        self.renderLocations(locations);
    };

    // Render locations, either all or filtered
    self.renderLocations = function(activeLocations) {
        // Clear all the lcoations in the locaiton list and clear all the markers on the map
        self.locationList.removeAll();
        view.clearMarkers();

        var l = activeLocations.length;
        for (var i = 0; i < l; i++) {
            view.renderLocation(activeLocations[i]);

            // Push the location into the list
            self.locationList.push(activeLocations[i]);
        }
    };

    // A function to piece together today's date. Used in getFourSquareData.
    function getToday() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }
        today = yyyy + mm + dd;
        return today;
    }


    // As the user clicks on a pin, show infowindow and request Foursqaure data
    self.onLocationClick = function(location) {
        getFoursquareData(location);
        view.showInfoWindow(location);
    };

    // Get Foursqaure data. Search by venue's geo-location.
    var foursquareKeyString = 'client_id=AALKABQH55DBDZPNU1F3Z4BN41FQPCAUFQ12QVVRLJM11YK3&client_secret= ARI0VFIJQNS51SCQ4YE5DYXDIJHELOPUPSOGONQ4GJT2U53K';

    function getFoursquareData(location) {
        // Request Foursqaure data
        var url = "https://api.foursquare.com/v2/venues/search?limit=1&ll=" + location.latIngA.toFixed(2) + "," +
            location.latIngB.toFixed(2) + "&query=" +
            location.name + '&' + foursquareKeyString + "&v=" + getToday();
        $.ajax({
            url: url,
            context: document.body
        }).done(function(data) {
            if (data.response.venues[0]) {
                // Get venue's url from Foursquare
                $('#fs-link').attr('href', data.response.venues[0].url);
                var venueId = data.response.venues[0].id;
                getFoursquarePhotos(location, venueId);
            } else {
                // If Foursquare does not have a response, set the link to the current page.
                $('#fs-link').attr('href', '#');
            }
        }).fail(function() {
            // If the request fails, the link is set to the current page,
            // and show a console.log info for the failed request.
            $('#fs-link').attr('href', '#');
            view.showAlert('Foursquare API is not available at the moment.');
        });
    }

    // Get Foursquare Photo for info window
    function getFoursquarePhotos(location, venueId) {
        // Get venue's photo URL from Foursquare by venue Id.
        var photoRequestUrl = 'https://api.foursquare.com/v2/venues/' + venueId + '/photos' +
            '?limit=1&' + foursquareKeyString +
            '&v=' + getToday();
        $.ajax({
            url: photoRequestUrl,
            context: document.body
        }).done(function(data) {
            if (data.response.photos.count == 1) {
                var photoUrl =
                    data.response.photos.items[0].prefix +
                    "width200" +
                    data.response.photos.items[0].suffix;
                $('#fs-photo').attr('src', photoUrl);
                view.resetInfoWindow(location);
            } else {
                // If there is no photo available from Foursquare, set the image to empty.
                $('#fs-photo').attr('src', '');
            }
        }).fail(function() {
            // If the request failed, set the image to empty, and show a console.log info for the failed request.
            $('#fs-photo').attr('src', '');
            view.showAlert('Foursquare API is not available at the moment.');
        });
    }

    self.keywords = ko.observable();

    // match keywords with location names
    self.search = function() {
        // Create an empty array to store filtered locations.
        var filteredLocations = [];
        // Split the keyword string by space
        var keywords = self.keywords().toLowerCase().split(' ');
        for (var j = 0; j < locations.length; j++) {
            for (var i = 0; i < keywords.length; i++) {
                // If any one of the keywords match with any of one of the words in locations' names,
                // save the matched location in the filteredLocations array.
                if (locations[j].name.toLowerCase().indexOf(keywords[i]) != -1) {
                    filteredlocations.push(locations[j]);
                    break;
                }
            }
        }
        // Render filtered locations
        self.renderlocations(filteredlocations);
    };

};


var View = function() {
      "use strict";
    var self = this;
    // Initialize Google Map
    var myLatlng = new google.maps.LatLng(37.940837, -121.934608);
    var mapOptions = {
        zoom: 17,
        center: myLatlng,
        disableDefaultUI: true
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    // Create infowindow
    var infowindow = new google.maps.InfoWindow({
        maxWidth: 320,
        zIndex: 200
    });

    // Create an object to store markers
    var markers = {};

    // Render locations on the view: map and list
    self.renderLocation = function(location) {
        var currentLocation = location;
        var id = currentLocation.id;
        var name = currentLocation.name;
        var description = currentLocation.description;
        var address = currentLocation.address;
        var markerLatLng = new google.maps.LatLng(currentLocation.latIngA, currentLocation.latIngB);

        // Put marker on the map
        var marker = new google.maps.Marker({
            position: markerLatLng,
            map: map,
            title: name
        });

        // Add event listener to marker
        google.maps.event.addListener(marker, 'click', (function(location) {
            return function() {
                viewModel.onLocationClick(location);
            };
        })(location));

        markers[id] = marker;
    };

    // Show infowindow on the screen
    self.showInfoWindow = function(location) {
        $('.collapse').collapse('hide');
        var marker = markers[location.id];
        infowindow.setContent(getMarkerContent(location));
        infowindow.open(map, marker);
        // Move the center of the map to the clicked marker
        // map.panTo(marker.position);
    };

    self.resetInfoWindow = function(location) {
        var marker = markers[location.id];
        infowindow.open(map, marker);
    };

    // Clear all the markers on the screen
    self.clearMarkers = function() {
        for (var id in markers) {
            markers[id].setMap(null);
        }
        markers = {};
    };

    self.showAlert = function(alert) {
        $('#alert-box').text('Oops! ' + alert);
        $('#alert-box').fadeIn().delay(3000).fadeOut();
    };

    // Assemble marker content
    function getMarkerContent(location) {
        var markerContent = '<div class="content row">' +
            '<div class="col-sm-6">' +
            '<a id="fs-link" target="_blank">' +
            '<h3 id="firstHeading" class="firstHeading">' + location.name + '</h3>' +
            '</a>' +
            '<div id="bodyContent">' +
            '<p>' + location.description + '</p>' +
            '<p>Address: ' + location.address + '</p>' +
            '</div>' +
            '</div><div class="col-sm-6"><img id="fs-photo"></img></div>' +
            '</div>';
        return markerContent;
    }

};

var viewModel = new ViewModel();
viewModel.initialize();
ko.applyBindings(viewModel);