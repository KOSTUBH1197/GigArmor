const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  triggerEvent: {
    type: { type: String, enum: ['rainfall', 'temperature', 'aqi', 'flood', 'curfew'], required: true },
    value: { type: Number, required: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    timestamp: { type: Date, required: true },
  },
  payoutAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
  fraudCheck: {
    passed: { type: Boolean, default: true },
    reasons: [{ type: String }],
  },
  paymentId: { type: String }, // For mock payment
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Claim', claimSchema);