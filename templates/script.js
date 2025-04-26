const socket = io();
socket.on('connect', () => {
  console.log("Connection successful")
})
socket.on('sensor-data', function (data) {
  if (data.sensorType === "home/air") {
    document.getElementById('mq135-value').textContent = data.value;
    const span = document.createElement("span")
    if(data.value >= 200){
      span.textContent = "(Air is not so good)"
      span.className = "status"
      document.getElementById('mq135-value').appendChild(span)
    }else if(data.value <= 100 ){
      span.textContent = "(Air is good)"
      span.className = "status"
      document.getElementById('mq135-value').appendChild(span)
    }else{
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
    } else if (data.value > 1500) {
      // const span = document.createElement("span")
      span.textContent = "(Soil is dry☹️)"
      span.className = "status text"
      document.getElementById('moisture-value').appendChild(span)
    } else {
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

