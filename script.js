/* =================================
   1. MAP INITIALIZATION
================================= */

var map = L.map("map").setView([26.403505, 75.875557], 19);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
  maxZoom: 22
}).addTo(map);


/* =================================
   2. FIRE LOCATION (DESTINATION)
================================= */

var fireLocation = {
  lat: 26.403505,
  lon: 75.875557
};

var fireIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/785/785116.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

L.marker([fireLocation.lat, fireLocation.lon], { icon: fireIcon })
  .addTo(map)
  .bindPopup("🔥 Fire Location")
  .openPopup();


/* =================================
   3. CONTROL ROOM (STATIC)
================================= */

var controlRoom = {
  lat: 26.402944,
  lon: 75.875582
};

var controlIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/619/619034.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35]
});

L.marker([controlRoom.lat, controlRoom.lon], { icon: controlIcon })
  .addTo(map)
  .bindPopup("🏢 Control Room");


/* =================================
   4. MOVING PERSON (REAL GPS)
================================= */

var personIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35]
});

var personMarker = L.marker([0, 0], { icon: personIcon }).addTo(map);


/* =================================
   5. SOLID PATH LINE
================================= */

var pathCoordinates = [];

var travelledPath = L.polyline(pathCoordinates, {
  color: "blue",
  weight: 6
}).addTo(map);


/* =================================
   6. DISTANCE CALCULATION
================================= */

function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000;
}


/* =================================
   7. REAL GPS TRACKING
================================= */

var lastLat = null;
var lastLon = null;

if (navigator.geolocation) {

  navigator.geolocation.watchPosition(
    function (position) {

      var userLat = position.coords.latitude;
      var userLon = position.coords.longitude;

      // Ignore very small GPS noise (<1 meter)
      if (lastLat && lastLon) {
        var movement = calculateDistance(lastLat, lastLon, userLat, userLon);
        if (movement < 1) return;
      }

      lastLat = userLat;
      lastLon = userLon;

      // Update marker position
      personMarker.setLatLng([userLat, userLon]);

      // Add to solid path
      pathCoordinates.push([userLat, userLon]);
      travelledPath.setLatLngs(pathCoordinates);

      // Center map on moving user
      map.setView([userLat, userLon]);

      // Update distance to fire
      var distance = calculateDistance(
        userLat,
        userLon,
        fireLocation.lat,
        fireLocation.lon
      ).toFixed(2);

      document.getElementById("distance").innerHTML =
        "🔥 Distance to Fire: " + distance + " meters";

    },
    function () {
      alert("Location access denied. Please allow GPS.");
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  );

} else {
  alert("Geolocation not supported.");
}


   

