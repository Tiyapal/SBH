const mqtt = require("mqtt");
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const routes = require('./routes/routes.js')
const data = require('./models/db.js')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')

const server = http.createServer(app)
const io = new Server(server)


app.use('/api', routes);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'templates')));

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');



const client = mqtt.connect("mqtt://localhost:1883");

//Subscribe to topic
client.on("connect", () => {
  console.log("Connected to mqtt")
  client.subscribe("home/air", (err) => {
    if (!err) {
      console.log("Subscribed to home/air")
    }
  });
  client.subscribe("home/pump", (err) => {
    if (!err) {
      console.log("Subscribed to home/pump")
    }
  })
  client.subscribe("home/moisture", (err) => {
    if (!err) {
      console.log("Subscribed to moisture sensor")
    }
  })
});

async function main() {
  await mongoose.connect('mongodb://localhost:27017/sensorReadings');
  console.log('Connected to database')
}
main().catch(err => console.log(err));


app.get('/', async (req, res) => {

  try {
    const readings = await data.find().sort({ timestamp: -1 }).limit(50); // latest 50
    res.render('dashboard', { readings });
  } catch (err) {
    res.status(500).send('Error fetching data');
  }
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'))
});


client.on('message', async (topic, message) => {
  console.log(`Received message ${message} on topic ${topic}`)
  if (topic === "home/moisture" || topic === "home/air") {

    const msg = message.toString()
    const value = parseInt(msg, 10)

    console.log(value)
    const sensorData = new data({
      sensorType: `${topic}`,
      value: `${value}`
    })
    try {
      await sensorData.save();
      console.log("Data save successful")
    } catch (err) {
      console.log("Error saving data: ", err)
    }
    const emitData = {
      sensorType: `${topic}`,
      value: `${value}`,
    }
    io.emit('sensor-data', emitData)
  }
  else if (topic == "home/pump") {
    console.log(message.toString())
    io.emit("pump-state", message.toString())
  }
  else {
    console.log("Invalid topic");
  }
})
io.on('connection', (socket) => {
  console.log("User connected")
  socket.on('disconnect', () => {
    console.log("User disconnected")
  })
})
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});