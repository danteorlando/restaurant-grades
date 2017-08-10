$(function() {
  var options = {
    center: new google.maps.LatLng(37.7519750, -122.1274020),
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  }
  var map = new google.maps.Map($("#map")[0], options);
  var markers = [];


  function clearMarkers() {
    if (markers.length > 0) {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      markers = [];
    }
  }

  google.maps.event.addListener(map, 'dragend', function(event) {
    drawMarkers(false);
  });

  google.maps.event.addListener(map, 'dragstart', function(event) {
    clearMarkers();
  });  

  function drawMarkers(firstTime) {

    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    };
    

    navigator.geolocation.getCurrentPosition(function(pos) {
      /*
      var you = new google.maps.Marker({
        position: new google.maps.LatLng(pos.coords.latitude,
                      pos.coords.longitude),
        map: map,
        animation: google.maps.Animation.DROP,
        title: "You are here!"
      });
  */
      //map.setCenter(you.getPosition());

      var currentLat, currentLon;
      if (firstTime) {
        currentLat = pos.coords.latitude;
        currentLon = pos.coords.longitude;
        map.setZoom(16);
      }
      else {
        currentLat = map.getCenter().lat();
        currentLon = map.getCenter().lng();
      }

      map.setCenter(new google.maps.LatLng(currentLat, currentLon));

      $.ajax({
          url: "https://data.acgov.org/resource/y2kh-zbwg.json",
          type: "GET",
          data: {
            "$where": "within_circle(location_1, " + currentLat + ", " + currentLon + ", 500)",  
            "$limit" : 5000,
            "$$app_token" : "W7RuQngZU2jChxMALUvtjlmEa"
          }
      }).done(function(data) {
        //alert("Retrieved " + data.length + " records from the dataset!");
        //console.log(data);
        $.each(data, function(i, restaurant) {
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(restaurant.location_1.coordinates[1], restaurant.location_1.coordinates[0]),
            map: map,
            animation: google.maps.Animation.DROP,
            optimized: false,
            title: restaurant.facility_name
          });
          markers.push(marker);

          var info_window = new google.maps.InfoWindow({
            content: '<div class="info-window">'
              + '<h4>' + restaurant.facility_name + '</h4>'
              + '<h5> grade = ' + restaurant.resource_code + '</h5>'
              + '<h5> date = ' + restaurant.activity_date + '</h5>'
              + '<p>' + restaurant.violation_description + '</p>'
              + '</div>'
          });
          google.maps.event.addListener(marker, 'click', function() {
            info_window.open(map, marker);
          });
        });
      });
    }, error, options);
}
  
drawMarkers(true);

/*
  $("#search").submit(function(event) {
    event.preventDefault();
    var search = $("#search .query").val();

    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    function success(pos) {
      var you = new google.maps.Marker({
        position: new google.maps.LatLng(pos.coords.latitude,
                      pos.coords.longitude),
        map: map,
        animation: google.maps.Animation.DROP,
        title: "You are here!"
      });
      map.setCenter(you.getPosition());
      map.setZoom(16);
    };

    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    };

    // Grab our current location and fetch nearby restaurants
    navigator.geolocation.getCurrentPosition(success, error, options);

  });
*/
});