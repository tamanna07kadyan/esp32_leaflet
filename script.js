// Control room coordinates
const controlRoom = { lat: 26.400500, lon: 75.872500 };

// Initialize map
const map = L.map('map').setView([controlRoom.lat, controlRoom.lon], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'Map data © OpenStreetMap contributors'
}).addTo(map);

// Marker for control room
const controlMarker = L.marker([controlRoom.lat, controlRoom.lon])
    .addTo(map)
    .bindPopup("Control Room")
    .openPopup();

// Store markers and paths
const espMarkers = {};
const espPaths = {};

// MQTT connect
const client = mqtt.connect('wss://test.mosquitto.org:8081');

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('esp32/alert', err => { if(!err) console.log('Subscribed'); });
});

client.on('message', (topic, message) => {
    let data = null;

    // First try JSON.parse
    try {
        data = JSON.parse(message.toString());
    } catch(e) {
        // Fallback to comma-separated
        const parts = message.toString().split(',');
        if(parts.length < 7) return; // skip invalid
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

    const device = data.device;
    const temp = data.temp || 0;
    const hum = data.hum || 0;
    const gas = data.gas || 0;
    const flame = data.flame || 0;
    const lat = data.lat;
    const lon = data.lon;

    // Remove old marker/path if exists
    if(espMarkers[device]) map.removeLayer(espMarkers[device]);
    if(espPaths[device]) map.removeLayer(espPaths[device]);

    // Add marker
    espMarkers[device] = L.marker([lat, lon], {
        icon: L.icon({
            iconUrl:'https://cdn-icons-png.flaticon.com/512/482/482682.png',
            iconSize:[32,32]
        })
    }).addTo(map)
      .bindPopup(`${device} ALERT<br>
                  Temp: ${temp}°C<br>
                  Hum: ${hum}%<br>
                  Gas: ${gas}<br>
                  Flame: ${flame}`)
      .openPopup();

    // Draw path
    espPaths[device] = L.polyline([[controlRoom.lat,controlRoom.lon],[lat,lon]], {
        color:'red', weight:4, opacity:0.7, dashArray:'10,10'
    }).addTo(map);

    // Fit bounds
    const group = new L.featureGroup([controlMarker, espMarkers[device]]);
    map.fitBounds(group.getBounds().pad(0.2));
});
