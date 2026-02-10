/* =================================
   1. MAP INITIALIZATION
================================= */

var map = L.map("map").setView([26.398367, 75.876068], 21);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
  maxZoom: 22
}).addTo(map);


/* =================================
   2. FIRE ESP32 LOCATION (FIXED)
================================= */

var fireESP32 = {
  lat: 26.398612,
  lon: 75.876319
};


/* =================================
   3. FIRE MARKER (SMALL)
================================= */

var fireMarker = L.circle(
  [fireESP32.lat, fireESP32.lon],
  {
    color: "red",
    fillColor: "red",
    fillOpacity: 0.8,
    radius: 0.3125
  }
).addTo(map);

fireMarker.bindPopup("🔥 FIRE DETECTED").openPopup();


/* =================================
   4. CONTROL ROOM MARKER (GPS)
================================= */

var controlMarker = L.circle(
  [0, 0],
  {
    color: "blue",
    fillColor: "blue",
    fillOpacity: 0.7,
    radius: 0.3125
  }
).addTo(map);

controlMarker.bindPopup("🧑‍🚒 Your Location");


/* =================================
   5. PATH LINE
================================= */

var firePath = L.polyline([], {
  color: "red",
  weight: 4
}).addTo(map);


/* =================================
   6. DISTANCE FUNCTION
================================= */

function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


/* =================================
   7. REAL GPS TRACKING (KEY PART)
================================= */

if ("geolocation" in navigator) {

  navigator.geolocation.watchPosition(
    function (position) {

      var lat = position.coords.latitude;
      var lon = position.coords.longitude;

      // Update marker
      controlMarker.setLatLng([lat, lon]);

      // Update path
      firePath.setLatLngs([
        [lat, lon],
        [fireESP32.lat, fireESP32.lon]
      ]);

      // Update distance
      var dist = distanceMeters(
        lat,
        lon,
        fireESP32.lat,
        fireESP32.lon
      ).toFixed(2);

      document.getElementById("distance").innerHTML =
        "📍 Distance to fire: " + dist + " meters";

      // Follow user like Google Maps
      map.panTo([lat, lon], { animate: true });

    },
    function (error) {
      document.getElementById("distance").innerHTML =
        "❌ Location access denied";
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000
    }
  );

} else {
  alert("Geolocation not supported");
}
