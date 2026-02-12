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
  iconUrl: "https://cdn-icons-png.flaticon.com/512/482/482132.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35]
});

L.marker([fireLocation.lat, fireLocation.lon], { icon: fireIcon })
  .addTo(map)
  .bindPopup("🔥 FIRE DETECTED")
  .openPopup();


/* =================================
   3. CONTROL ROOM (STATIC)
================================= */

var controlRoom = {
  lat: 26.402944,
  lon: 75.875582
};

var controlIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

L.marker([controlRoom.lat, controlRoom.lon], { icon: controlIcon })
  .addTo(map)
  .bindPopup("🏢 Control Room");


/* =================================
   4. MOVING USER MARKER
================================= */

var userIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

var userMarker = L.marker([0, 0], { icon: userIcon }).addTo(map);


/* =================================
   5. SOLID PATH (FULL LINE)
================================= */

var pathCoordinates = [];

var travelledPath = L.polyline(pathCoordinates, {
  color: "blue",
  weight: 5
}).addTo(map);


/* =================================
   6. DISTANCE FUNCTION
================================= */

function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000;
}


/* =================================
   7. REAL GPS TRACKING (STABLE)
================================= */

var lastLat = null;
var lastLon = null;

if (navigator.geolocation) {

  navigator.geolocation.watchPosition(
    function (position) {

      var userLat = position.coords.latitude;
      var userLon = position.coords.longitude;

      // Ignore very tiny movements (GPS noise)
      if (lastLat && lastLon) {
        var movement = calculateDistance(lastLat, lastLon, userLat, userLon);
        if (movement < 1) return; // Ignore movement less than 1 meter
      }

      lastLat = userLat;
      lastLon = userLon;

      // Update marker
      userMarker.setLatLng([userLat, userLon]);

      // Add to path
      pathCoordinates.push([userLat, userLon]);
      travelledPath.setLatLngs(pathCoordinates);

      // Keep map centered smoothly
      map.setView([userLat, userLon]);

      // Distance to fire
      var distance = calculateDistance(
        userLat,
        userLon,
        fireLocation.lat,
        fireLocation.lon
      ).toFixed(2);

      document.getElementById("distance").innerHTML =
        "🔥 Distance to Fire: " + distance + " meters";

    },
    function (error) {
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


   

