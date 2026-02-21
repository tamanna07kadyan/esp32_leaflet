// Control room coordinates
const controlRoom = { lat:26.400500, lon:75.872500 };

// Initialize map
const map = L.map('map').setView([controlRoom.lat, controlRoom.lon], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

// Marker for control room
const controlMarker = L.marker([controlRoom.lat, controlRoom.lon])
    .addTo(map)
    .bindPopup("Control Room")
    .openPopup();

// Store markers and paths for devices
const espMarkers = {};
const espPaths = {};

// Connect to HiveMQ WebSocket broker
const client = mqtt.connect('wss://test.mosquitto.org:8081');

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('esp32/alert', err => { 
        if(!err) console.log('Subscribed to esp32/alert'); 
    });
});

client.on('message', (topic, message) => {
    // Split comma-separated payload
    // deviceName,temp,hum,gas,flame,lat,lon
    const parts = message.toString().split(',');

    if(parts.length < 7) return; // skip invalid messages

    const device = parts[0];
    const temp = parseFloat(parts[1]);
    const hum = parseFloat(parts[2]);
    const gas = parseFloat(parts[3]);
    const flame = parseInt(parts[4]);
    const lat = parseFloat(parts[5]);
    const lon = parseFloat(parts[6]);

    // Remove old marker/path if exists
    if(espMarkers[device]) map.removeLayer(espMarkers[device]);
    if(espPaths[device]) map.removeLayer(espPaths[device]);

    // Add marker for ESP32 alert
    espMarkers[device] = L.marker([lat,lon], {
        icon: L.icon({
            iconUrl:'https://cdn-icons-png.flaticon.com/512/482/482682.png',
            iconSize:[32,32]
        })
    }).addTo(map)
      .bindPopup(`${device} ALERT<br>Temp: ${temp}°C<br>Hum: ${hum}%<br>Gas: ${gas}<br>Flame: ${flame}`)
      .openPopup();

    // Draw path from control room
    espPaths[device] = L.polyline([[controlRoom.lat,controlRoom.lon],[lat,lon]], {
        color:'red', weight:4, opacity:0.7, dashArray:'10,10'
    }).addTo(map);

    // Fit map to include control room + ESP32
    const group = new L.featureGroup([controlMarker, espMarkers[device]]);
    map.fitBounds(group.getBounds().pad(0.2));
});
