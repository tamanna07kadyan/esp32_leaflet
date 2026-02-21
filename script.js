// ===== CONTROL ROOM COORDINATES =====
const controlRoom = { lat: 26.400500, lon: 75.872500 };

// ===== INITIALIZE MAP =====
const map = L.map('map').setView([controlRoom.lat, controlRoom.lon], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

// ===== CONTROL ROOM MARKER =====
const controlMarker = L.marker([controlRoom.lat, controlRoom.lon])
    .addTo(map)
    .bindPopup("Control Room")
    .openPopup();

// ===== STORE ESP32 MARKERS & PATHS =====
const espMarkers = {};   // marker per device
const espPaths = {};     // path per device

// ===== MQTT CONNECTION TO HiveMQ =====
const client = mqtt.connect('wss://test.mosquitto.org:8081');

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('esp32/alert', err => {
        if(!err) console.log('Subscribed to esp32/alert');
    });
});

client.on('message', (topic, message) => {
    // Split comma-separated message: deviceName,temp,hum,gas,flame,lat,lon
    const parts = message.toString().split(',');
    
    if(parts.length < 7) return; // skip invalid messages

    const device = parts[0];
    const temp = parseFloat(parts[1]);
    const hum = parseFloat(parts[2]);
    const gas = parseFloat(parts[3]);
    const flame = parseInt(parts[4]);
    const lat = parseFloat(parts[5]);
    const lon = parseFloat(parts[6]);

    // ===== REMOVE OLD MARKER & PATH IF EXISTS =====
    if(espMarkers[device]) map.removeLayer(espMarkers[device]);
    if(espPaths[device]) map.removeLayer(espPaths[device]);

    // ===== ADD MARKER FOR ALERT =====
    espMarkers[device] = L.marker([lat,lon], {
        icon: L.icon({
            iconUrl:'https://cdn-icons-png.flaticon.com/512/482/482682.png', // fire icon
            iconSize:[32,32]
        })
    }).addTo(map)
      .bindPopup(`${device} ALERT<br>
                  Temp: ${temp}°C<br>
                  Hum: ${hum}%<br>
                  Gas: ${gas}<br>
                  Flame: ${flame}`)
      .openPopup();

    // ===== DRAW PATH FROM CONTROL ROOM =====
    espPaths[device] = L.polyline([[controlRoom.lat,controlRoom.lon],[lat,lon]], {
        color:'red', weight:4, opacity:0.7, dashArray:'10,10'
    }).addTo(map);

    // ===== FIT MAP TO INCLUDE CONTROL ROOM + ESP32 =====
    const group = new L.featureGroup([controlMarker, espMarkers[device]]);
    map.fitBounds(group.getBounds().pad(0.2));
});
