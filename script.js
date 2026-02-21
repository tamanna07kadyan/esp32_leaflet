// ===== CONTROL ROOM =====
const controlRoom = { lat: 26.400500, lon: 75.872500 };

// ===== MAP INIT =====
const map = L.map('map').setView([controlRoom.lat, controlRoom.lon], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// ===== CONTROL ROOM MARKER =====
const controlMarker = L.marker([controlRoom.lat, controlRoom.lon])
    .addTo(map)
    .bindPopup("Control Room")
    .openPopup();

// ===== STORE DEVICES =====
const espMarkers = {};
const espPaths = {};

// ===== MQTT CONNECT =====
const client = mqtt.connect('wss://test.mosquitto.org:8081');

client.on('connect', function () {
    console.log("Connected to HiveMQ");
    client.subscribe('esp32/alert');
});

client.on('message', function (topic, message) {

    let data;

    // Try JSON first
    try {
        data = JSON.parse(message.toString());
    } catch (e) {
        // If not JSON, try comma format
        const parts = message.toString().split(',');
        if (parts.length < 7) return;

        data = {
            device: parts[0],
            temp: parseFloat(parts[1]),
            hum: parseFloat(parts[2]),
            gas: parseFloat(parts[3]),
            flame: parseInt(parts[4]),
            lat: parseFloat(parts[5]),
            lon: parseFloat(parts[6])
        };
    }

    if (!data.lat || !data.lon || !data.device) return;

    const device = data.device;

    // Remove old marker and path
    if (espMarkers[device]) map.removeLayer(espMarkers[device]);
    if (espPaths[device]) map.removeLayer(espPaths[device]);

    // Add new marker
    espMarkers[device] = L.marker([data.lat, data.lon], {
        icon: L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/482/482682.png',
            iconSize: [32, 32]
        })
    }).addTo(map)
      .bindPopup(
        device + " ALERT<br>" +
        "Temp: " + (data.temp || 0) + "°C<br>" +
        "Hum: " + (data.hum || 0) + "%<br>" +
        "Gas: " + (data.gas || 0) + "<br>" +
        "Flame: " + (data.flame || 0)
      )
      .openPopup();

    // Draw path
    espPaths[device] = L.polyline(
        [[controlRoom.lat, controlRoom.lon], [data.lat, data.lon]],
        { color: 'red', weight: 4, dashArray: '10,10' }
    ).addTo(map);

    // Zoom properly
    const group = new L.featureGroup([controlMarker, espMarkers[device]]);
    map.fitBounds(group.getBounds().pad(0.2));
});
