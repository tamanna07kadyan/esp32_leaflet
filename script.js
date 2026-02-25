// ===============================
// ESP32-1 = Control Room (Base)
// ===============================
var baseLocation = [26.403216, 75.875765];

// Initialize Map
var map = L.map('map').setView(baseLocation, 18);

// OpenStreetMap Tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// Base Marker
L.marker(baseLocation)
    .addTo(map)
    .bindPopup("🏢 ESP32-1 (Control Room)")
    .openPopup();

// Variables to store current fire marker & path
var fireMarker = null;
var pathLine = null;

// ===============================
// CONNECT TO HIVEMQ (SECURE WSS)
// ===============================
var client = mqtt.connect("wss://broker.hivemq.com:8000/mqtt", {
    reconnectPeriod: 2000,
    connectTimeout: 4000,
    clean: true
});
// When connected
client.on("connect", function () {
    console.log("Connected to HiveMQ");
    client.subscribe("fire/alert");
});

// When message received
client.on("message", function (topic, message) {

    console.log("Message Received:", message.toString());

    var data = message.toString().split(",");

    // Payload format:
    // device,temp,hum,gas,ir,lat,lon

    var device = data[0];
    var lat = parseFloat(data[5]);
    var lon = parseFloat(data[6]);

    // Remove old marker if exists
    if (fireMarker !== null) {
        map.removeLayer(fireMarker);
    }

    // Remove old path if exists
    if (pathLine !== null) {
        map.removeLayer(pathLine);
    }

    // Add new fire marker
    fireMarker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup("🔥 Fire Alert at " + device)
        .openPopup();

    // Draw new path from Control Room to Fire Location
    pathLine = L.polyline([baseLocation, [lat, lon]], {
        color: "red",
        weight: 5
    }).addTo(map);

    // Move map to fire location
    map.setView([lat, lon], 18);
});

// If connection lost
client.on("error", function (error) {
    console.log("Connection error:", error);
});
