const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    sensorType: { type: String, required: true }, // "moisture" or "gas"
    value: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
})
module.exports = mongoose.model('reading', dataSchema)