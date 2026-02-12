/* ===========================
   FIRE LOCATION
=========================== */

const fireLat = 26.403505;
const fireLon = 75.875557;

/* ===========================
   INITIALIZE MAP
=========================== */

var map = L.map("map").setView([fireLat, fireLon], 18);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
  maxZoom: 22
}).addTo(map);

/* ===========================
   FIRE MARKER
=========================== */

var fireIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/785/785116.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

L.marker([fireLat, fireLon], { icon: fireIcon })
  .addTo(map)
  .bindPopup("🔥 Fire Location")
  .openPopup();

/* ===========================
   PERSON MARKER
=========================== */

var personIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35]
});

var personMarker = L.marker([fireLat, fireLon], { icon: personIcon }).addTo(map);

/* ===========================
   ROUTE LINE
=========================== */

var routeLine = L.polyline([], {
  color: "red",
  weight: 6
}).addTo(map);

/* ===========================
   FUNCTION TO GET ROAD ROUTE
=========================== */

async function fetchRoute(userLat, userLon) {

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${userLon},${userLat};${fireLon},${fireLat}` +
    `?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {

      const coordinates = data.routes[0].geometry.coordinates;

      const latLngs = coordinates.map(coord => [
        coord[1],  // latitude
        coord[0]   // longitude
      ]);

      routeLine.setLatLngs(latLngs);
    }

  } catch (error) {
    console.log("Routing error:", error);
  }
}

/* ===========================
   REAL TIME GPS TRACKING
=========================== */

var lastLat = null;
var lastLon = null;

if (navigator.geolocation) {

  navigator.geolocation.watchPosition(
    function(position) {

      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;

      // Ignore tiny movements (<2 meters)
      if (lastLat && lastLon) {
        const distance = map.distance(
          [lastLat, lastLon],
          [userLat, userLon]
        );
        if (distance < 2) return;
      }

      lastLat = userLat;
      lastLon = userLon;

      // Move marker
      personMarker.setLatLng([userLat, userLon]);

      // Center map
      map.panTo([userLat, userLon]);

      // Fetch new route
      fetchRoute(userLat, userLon);

    },
    function() {
      alert("Please allow location access.");
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



   

