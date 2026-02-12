/* =========================
   FIRE LOCATION
========================= */

const fireLat = 26.403505;
const fireLon = 75.875557;

/* =========================
   INITIALIZE MAP
========================= */

var map = L.map("map").setView([fireLat, fireLon], 18);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
  maxZoom: 22
}).addTo(map);

/* =========================
   FIRE ICON
========================= */

var fireIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/785/785116.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

L.marker([fireLat, fireLon], { icon: fireIcon })
  .addTo(map)
  .bindPopup("🔥 Fire Location")
  .openPopup();

/* =========================
   PERSON ICON
========================= */

var personIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35]
});

var personMarker = L.marker([fireLat, fireLon], { icon: personIcon }).addTo(map);

/* =========================
   ROUTE LINE
========================= */

var routeLine = L.polyline([], {
  color: "red",
  weight: 6
}).addTo(map);

/* =========================
   FETCH ROUTE FROM OSRM
========================= */

async function getRoute(userLat, userLon) {

  const url = `https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${fireLon},${fireLat}?overview=full&geometries=geojson`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.routes.length > 0) {

    const routeCoordinates = data.routes[0].geometry.coordinates;

    const latLngs = routeCoordinates.map(coord => [coord[1], coord[0]]);

    routeLine.setLatLngs(latLngs);
  }
}

/* =========================
   REAL TIME GPS
========================= */

var lastLat = null;
var lastLon = null;

if (navigator.geolocation) {

  navigator.geolocation.watchPosition(
    function(position) {

      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;

      // Ignore tiny GPS noise (<2 meters)
      if (lastLat && lastLon) {
        const moved = map.distance(
          [lastLat, lastLon],
          [userLat, userLon]
        );
        if (moved < 2) return;
      }

      lastLat = userLat;
      lastLon = userLon;

      personMarker.setLatLng([userLat, userLon]);

      map.panTo([userLat, userLon]);

      // Get new route
      getRoute(userLat, userLon);

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


   

