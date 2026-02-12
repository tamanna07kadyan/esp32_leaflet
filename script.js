/* ===============================
   FIRE ESP32 FIXED LOCATION
================================ */
const fireESP32 = {
  lat: 26.398612,
  lon: 75.876319
};

/* ===============================
   MAP INITIALIZATION
================================ */
const map = L.map("map").setView([fireESP32.lat, fireESP32.lon], 18);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 22,
  attribution: "© OpenStreetMap"
}).addTo(map);

/* ===============================
   FIRE MARKER
================================ */
const fireMarker = L.marker([fireESP32.lat, fireESP32.lon])
  .addTo(map)
  .bindPopup("🔥 Fire Detected");

/* ===============================
   CONTROL ROOM MARKER (GPS)
================================ */
let controlMarker = null;
let pathLine = null;

/* ===============================
   DISTANCE FUNCTION
================================ */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ===============================
   REAL GPS TRACKING
================================ */
if ("geolocation" in navigator) {

  navigator.geolocation.watchPosition(
    (position) => {

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      if (!controlMarker) {
        controlMarker = L.marker([lat, lon]).addTo(map);
        pathLine = L.polyline([[lat, lon], [fireESP32.lat, fireESP32.lon]], {
          color: "red"
        }).addTo(map);
      } else {
        controlMarker.setLatLng([lat, lon]);
        pathLine.setLatLngs([[lat, lon], [fireESP32.lat, fireESP32.lon]]);
      }

      const distance = calculateDistance(
        lat, lon,
        fireESP32.lat, fireESP32.lon
      ).toFixed(2);

      document.getElementById("distance").innerHTML =
        "📍 Distance to fire: " + distance + " meters";

    },
    (error) => {
      document.getElementById("distance").innerHTML =
        "❌ Location error: Allow GPS permission";
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 10000
    }
  );

} else {
  alert("GPS not supported");
}




   

