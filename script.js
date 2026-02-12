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

var fireMarker = L.marker(
  [fireLocation.lat, fireLocation.lon],
  { icon: fireIcon }
).addTo(map);

fireMarker.bindPopup("🔥 FIRE DETECTED").openPopup();


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

var controlMarker = L.marker(
  [controlRoom.lat, controlRoom.lon],
  { icon: controlIcon }
).addTo(map);

controlMarker.bindPopup("🏢 Control Room");


/* =================================
   4. MOVING LOCATION (LIVE USER)
================================= */

var movingIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

var movingMarker = L.marker([0, 0], {
  icon: movingIcon
}).addTo(map);

movingMarker.bindPopup("📍 Moving Location");


/* =================================
   5. DASHED PATH (TRAVELLED PATH)
================================= */

var travelledPath = L.polyline([], {
  color: "blue",
  weight: 4,
  dashArray: "8,8"
}).addTo(map);

var pathCoordinates = [];


/* =================================
   6. DISTANCE CALCULATION FUNCTION
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
   7. REAL-TIME GPS TRACKING
================================= */

if (navigator.geolocation) {

  navigator.geolocation.watchPosition(function (position) {

    var userLat = position.coords.latitude;
    var userLon = position.coords.longitude;

    movingMarker.setLatLng([userLat, userLon]);

    map.setView([userLat, userLon], 19);

    pathCoordinates.push([userLat, userLon]);
    travelledPath.setLatLngs(pathCoordinates);

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
    alert("Location access denied. Please allow GPS permission.");
  },
  {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
  });

} else {
  alert("Geolocation is not supported by this browser.");
}

   

