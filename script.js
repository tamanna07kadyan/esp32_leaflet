var map = L.map('map').setView([28.6139, 77.2090], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// Secure WebSocket for HTTPS site
const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

client.on("connect", function () {
    console.log("Connected to HiveMQ");
    client.subscribe("esp32/alert");
});

client.on("message", function (topic, message) {
    let data = JSON.parse(message.toString());

    let lat = data.lat;
    let lon = data.lon;

    L.marker([lat, lon])
        .addTo(map)
        .bindPopup("🔥 Fire Alert Detected!")
        .openPopup();

    map.setView([lat, lon], 18);
});

client.on("error", function (error) {
    console.log("Connection error: ", error);
});
