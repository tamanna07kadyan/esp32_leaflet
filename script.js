/* ==============================
   1. INITIALIZE MAP
============================== */

var map = L.map("map").setView([26.403505, 75.875557], 18);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
  maxZoom: 22
}).addTo(map);


/* ==============================
   2. FIRE LOCATION
============================== */

var fireLocation = L.latLng(26.403505, 75.875557);

var fireIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/785/785116.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

L.marker(fireLocation, { icon: fireIcon })
  .addTo(map)
  .bindPopup("🔥 Fire Location")
  .openPopup();


/* ==============================
   3. PERSON ICON (GPS)
============================== */

var personIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35]
});

var personMarker = L.marker([0, 0], { icon: personIcon }).addTo(map);


/* ==============================
   4. ROUTING CONTROL
============================== */

var routingControl = null;


/* ==============================
   5. REAL TIME GPS TRACKING
============================== */

if (navigator.geolocation) {

  navigator.geolocation.watchPosition(
    function (position) {

      var userLat = position.coords.latitude;
      var userLon = position.coords.longitude;

      var userLocation = L.latLng(userLat, userLon);

      personMarker.setLatLng(userLocation);

      map.setView(userLocation);

      // Remove previous route
      if (routingControl != null) {
        map.removeControl(routingControl);
      }

      // Create new route
      routingControl = L.Routing.control({
        waypoints: [
          userLocation,
          fireLocation
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        show: true,
        lineOptions: {
          styles: [{ color: "red", weight: 6 }]
        },
        createMarker: function () { return null; } // prevent default markers
      }).addTo(map);

    },
    function () {
      alert("Please allow GPS access.");
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



   

