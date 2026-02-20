// CONTROL ROOM LOCATION
var controlLat = 26.403216;
var controlLon = 75.875765;

// Initialize map
var map = L.map('map').setView([controlLat, controlLon], 18);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// Control Room Marker
var controlMarker = L.marker([controlLat, controlLon])
  .addTo(map)
  .bindPopup("🏢 Control Room")
  .openPopup();

// Fire marker and path
var fireMarker = null;
var pathLine = null;

// Connect to MQTT
var client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

client.on('connect', function () {
  console.log("Connected to MQTT");
  client.subscribe('esp32/alert');
});

client.on('message', function (topic, message) {

  var data = JSON.parse(message.toString());

  var fireLat = data.lat;
  var fireLon = data.lon;

  // Remove old marker & path
  if (fireMarker != null) {
    map.removeLayer(fireMarker);
  }

  if (pathLine != null) {
    map.removeLayer(pathLine);
  }

  // Add new fire marker
  fireMarker = L.marker([fireLat, fireLon])
    .addTo(map)
    .bindPopup("🔥 FIRE DETECTED at " + data.device)
    .openPopup();

  // Draw red path
  pathLine = L.polyline([
    [controlLat, controlLon],
    [fireLat, fireLon]
  ], {
    color: 'red',
    weight: 4
  }).addTo(map);

  map.fitBounds(pathLine.getBounds());
});


   

