const socket = io();
socket.on('connect', () => {
  console.log("Connection successful")
})
socket.on('sensor-data', function (data) {
  if (data.sensorType === "home/air") {
    document.getElementById('mq135-value').textContent = data.value;
    const span = document.createElement("span")
    if (data.value >= 200) {
      span.textContent = "(Air is not so good)"
      span.className = "status"
      document.getElementById('mq135-value').appendChild(span)
    } else if (data.value <= 100) {
      span.textContent = "(Air is good)"
      span.className = "status"
      document.getElementById('mq135-value').appendChild(span)
    } else {
      span.textContent = "(Air is fine)"
      span.className = "status"
      document.getElementById('mq135-value').appendChild(span)
    }
  } else if (data.sensorType === "home/moisture") {
    document.getElementById('moisture-value').textContent = data.value;
    const span = document.createElement("span")
    if (data.value < 1500) {
      span.textContent = "(Soil is moist😊)"
      span.className = "status text"
      document.getElementById('moisture-value').appendChild(span)
    }
    else if (data.value > 1500) {
      // const span = document.createElement("span")
      span.textContent = "(Soil is dry☹️)"
      span.className = "status text"
      document.getElementById('moisture-value').appendChild(span)
    } else if (data.value > 1500 && data.value < 2000) {
      document.getElementById('moisture-value').removeChild(span)
    }
  }
})
socket.on('pump-state', (data) => {
  const pumpEl = document.getElementById('pump-status');
  if (data === "ON") {
    pumpEl.textContent = 'ON';
    pumpEl.classList.add('status-on');
    pumpEl.classList.remove('status-off');
  } else {
    pumpEl.textContent = 'OFF';
    pumpEl.classList.add('status-off');
    pumpEl.classList.remove('status-on');
  }
})

 // Store latest values
 const moistureData = {
  labels: [],
  datasets: [{
    label: 'Moisture',
    data: [],
    borderColor: 'blue',
    backgroundColor: 'rgba(0, 0, 255, 0.1)',
    fill: false,
    tension: 0.3
  }]
};

const airData = {
  labels: [],
  datasets: [{
    label: 'Air Quality',
    data: [],
    borderColor: 'green',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    fill: false,
    tension: 0.3
  }]
};

const moistureChart = new Chart(
  document.getElementById('moistureChart').getContext('2d'),
  {
    type: 'line',
    data: moistureData,
    options: {
      animation: false,
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Time' } },
        y: { title: { display: true, text: 'Value' }, beginAtZero: true }
      }
    }
  }
);

const airChart = new Chart(
  document.getElementById('airChart').getContext('2d'),
  {
    type: 'line',
    data: airData,
    options: {
      animation: false,
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Time' } },
        y: { title: { display: true, text: 'Value' }, beginAtZero: true , max : 300 }
      }
    }
  }
);

// Handle incoming sensor data
socket.on('sensor-data', (data) => {
  const time = new Date().toLocaleTimeString();

  if (data.sensorType === 'home/moisture') {
    moistureData.labels.push(time);
    moistureData.datasets[0].data.push(data.value);

    if (moistureData.labels.length > 20) {
      moistureData.labels.shift();
      moistureData.datasets[0].data.shift();
    }

    moistureChart.update();
  }

  if (data.sensorType === 'home/air') {
    airData.labels.push(time);
    airData.datasets[0].data.push(data.value);

    if (airData.labels.length > 20) {
      airData.labels.shift();
      airData.datasets[0].data.shift();
    }

    airChart.update();
  }
});