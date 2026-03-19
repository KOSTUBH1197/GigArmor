const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weeklyPremium: { type: Number, required: true },
  coverageAmount: { type: Number, required: true }, // e.g., 70% of average weekly income
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  riskFactors: {
    weatherRisk: { type: Number, default: 0 },
    pollutionRisk: { type: Number, default: 0 },
    floodRisk: { type: Number, default: 0 },
    locationRisk: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Policy', policySchema);