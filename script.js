// Create map
var map = L.map('map').setView([28.6139, 77.2090], 12);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// MQTT Connection
const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt", {
    clientId: "tamanna_web_" + Math.random().toString(16).substr(2, 8),
    clean: true,
    reconnectPeriod: 2000,
    connectTimeout: 10000,
    keepalive: 60
});

const topic = "esp32/alert";

let marker = null;

// When Connected
client.on("connect", function () {
    console.log("Connected to HiveMQ");
    document.getElementById("status").innerHTML = "✅ Connected to HiveMQ";
    document.getElementById("status").style.color = "green";

    client.subscribe(topic);
});

// When Message Received
client.on("message", function (topic, message) {
    console.log("Message received:", message.toString());

    try {
        let data = JSON.parse(message.toString());

        let lat = data.lat;
        let lon = data.lon;
        let temp = data.temperature;
        let hum = data.humidity;
        let alert = data.alert;

        // Remove old marker
        if (marker !== null) {
            map.removeLayer(marker);
        }

        // Add new marker
        marker = L.marker([lat, lon]).addTo(map);

        marker.bindPopup(
            "🔥 ALERT: " + alert +
            "<br>🌡 Temperature: " + temp +
            "<br>💧 Humidity: " + hum
        ).openPopup();

        map.setView([lat, lon], 16);

    } catch (e) {
        console.log("Invalid JSON:", e);
    }
});

// Error Handling
client.on("error", function (err) {
    console.log("Connection error:", err);
    document.getElementById("status").innerHTML = "❌ Connection Error";
    document.getElementById("status").style.color = "red";
});

client.on("close", function () {
    console.log("Connection closed");
    document.getElementById("status").innerHTML = "⚠️ Connection Closed";
    document.getElementById("status").style.color = "orange";
});
