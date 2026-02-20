var controlRoom = [26.403216, 75.875765];

var map = L.map('map').setView(controlRoom, 17);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
.addTo(map);

L.marker(controlRoom)
  .addTo(map)
  .bindPopup("Control Room")
  .openPopup();

const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

client.on("connect", function () {
    console.log("Connected to MQTT");
    client.subscribe("esp32/alert");
});

let markers = {};

client.on("message", function (topic, message) {

    let data = JSON.parse(message.toString());
    let device = data.device;
    let location = [data.lat, data.lon];

    if (markers[device]) {
        map.removeLayer(markers[device]);
    }

    markers[device] = L.marker(location)
        .addTo(map)
        .bindPopup(device + " ALERT!")
        .openPopup();

    map.setView(location, 18);
});
