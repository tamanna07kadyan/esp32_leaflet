// ===== CONTROL ROOM =====
const controlRoom = { lat: 26.400500, lon: 75.872500 };

// ===== MAP =====
const map = L.map('map').setView([controlRoom.lat, controlRoom.lon], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

const controlMarker = L.marker([controlRoom.lat, controlRoom.lon])
    .addTo(map)
    .bindPopup("Control Room")
    .openPopup();

const espMarkers = {};
const espPaths = {};

// ===== HIVEMQ WEBSOCKET CONNECTION =====
const client = mqtt.connect('ws://broker.hivemq.com:8000/mqtt');

client.on('connect', function () {
    console.log("Connected to HiveMQ");
    client.subscribe('esp32/alert');
});

client.on('message', function (topic, message) {

    console.log("Message received:", message.toString());

    let data;

    try {
        data = JSON.parse(message.toString());
    } catch (e) {
        console.log("Invalid JSON");
        return;
    }

    if (!data.device || !data.lat || !data.lon) return;

    const device = data.device;
    const lat = parseFloat(data.lat);
    const lon = parseFloat(data.lon);

    // Remove old marker/path
    if (espMarkers[device]) map.removeLayer(espMarkers[device]);
    if (espPaths[device]) map.removeLayer(espPaths[device]);

    // Add marker
    espMarkers[device] = L.marker([lat, lon], {
        icon: L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/482/482682.png',
            iconSize: [32, 32]
        })
    }).addTo(map)
      .bindPopup("<b>" + device + " ON FIRE</b>")
      .openPopup();

    // Draw path
    espPaths[device] = L.polyline(
        [[controlRoom.lat, controlRoom.lon], [lat, lon]],
        { color: 'red', weight: 4 }
    ).addTo(map);

    const group = new L.featureGroup([controlMarker, espMarkers[device]]);
    map.fitBounds(group.getBounds().pad(0.2));
});
