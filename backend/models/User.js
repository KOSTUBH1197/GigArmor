const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['worker', 'admin'], default: 'worker' },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true },
  },
  deliveryPlatform: { type: String, enum: ['swiggy', 'zomato', 'zepto', 'amazon', 'other'], required: true },
  averageWeeklyIncome: { type: Number, required: true },
  riskScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);