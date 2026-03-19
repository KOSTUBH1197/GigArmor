const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const User = require('../models/User');
const axios = require('axios');

const claimsController = {
  // Get all claims (admin)
  getAllClaims: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const claims = await Claim.find()
        .populate('policyId', 'weeklyPremium coverageAmount')
        .populate('workerId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Claim.countDocuments();

      res.json({
        claims,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all claims error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get claims by worker
  getClaimsByWorker: async (req, res) => {
    try {
      const { workerId } = req.params;

      // Check permissions
      if (req.user.role !== 'admin' && req.user.userId !== workerId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const claims = await Claim.find({ workerId })
        .populate('policyId', 'weeklyPremium coverageAmount')
        .sort({ createdAt: -1 });

      res.json(claims);
    } catch (error) {
      console.error('Get claims by worker error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Create claim (automatic or manual)
  createClaim: async (req, res) => {
    try {
      const { policyId, triggerEvent, payoutAmount } = req.body;

      const policy = await Policy.findById(policyId);
      if (!policy || policy.status !== 'active') {
        return res.status(400).json({ message: 'Invalid or inactive policy' });
      }

      // Check if claim already exists for this trigger in last 24 hours
      const existingClaim = await Claim.findOne({
        policyId,
        'triggerEvent.type': triggerEvent.type,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      if (existingClaim) {
        return res.status(400).json({ message: 'Claim already exists for this trigger' });
      }

      // Fraud check via AI service
      let fraudCheck = { passed: true, reasons: [] };
      try {
        const fraudResponse = await axios.post(`${process.env.AI_SERVICE_URL}/check-fraud`, {
          workerId: policy.workerId,
          triggerEvent,
          location: triggerEvent.location,
        }, { timeout: 5000 });

        fraudCheck = fraudResponse.data;
      } catch (error) {
        console.warn('Fraud check service unavailable, proceeding without check');
      }

      const claim = new Claim({
        policyId,
        workerId: policy.workerId,
        triggerEvent,
        payoutAmount: payoutAmount || policy.coverageAmount,
        fraudCheck,
      });

      await claim.save();

      // If fraud check passes, auto-approve and process payment
      if (fraudCheck.passed) {
        claim.status = 'paid';
        claim.paymentId = 'mock_payment_' + Date.now();
        await claim.save();
      }

      res.status(201).json(claim);
    } catch (error) {
      console.error('Create claim error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update claim status
  updateClaimStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const allowedStatuses = ['pending', 'approved', 'rejected', 'paid'];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const claim = await Claim.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate('policyId workerId', 'name email');

      if (!claim) {
        return res.status(404).json({ message: 'Claim not found' });
      }

      res.json(claim);
    } catch (error) {
      console.error('Update claim status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get claim by ID
  getClaimById: async (req, res) => {
    try {
      const claim = await Claim.findById(req.params.id)
        .populate('policyId', 'weeklyPremium coverageAmount status')
        .populate('workerId', 'name email phone');

      if (!claim) {
        return res.status(404).json({ message: 'Claim not found' });
      }

      res.json(claim);
    } catch (error) {
      console.error('Get claim by ID error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Process payout (mock)
  processPayout: async (req, res) => {
    try {
      const claim = await Claim.findById(req.params.id);

      if (!claim) {
        return res.status(404).json({ message: 'Claim not found' });
      }

      if (claim.status !== 'approved') {
        return res.status(400).json({ message: 'Claim must be approved before payout' });
      }

      // Mock payment processing
      claim.status = 'paid';
      claim.paymentId = 'mock_payment_' + Date.now();
      claim.updatedAt = new Date();

      await claim.save();

      res.json({
        claim,
        message: 'Payout processed successfully',
        paymentId: claim.paymentId
      });
    } catch (error) {
      console.error('Process payout error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Validate claim (admin)
  validateClaim: async (req, res) => {
    try {
      const { isValid, notes } = req.body;

      const claim = await Claim.findById(req.params.id);
      if (!claim) {
        return res.status(404).json({ message: 'Claim not found' });
      }

      if (isValid) {
        claim.status = 'approved';
      } else {
        claim.status = 'rejected';
        claim.fraudCheck.passed = false;
        claim.fraudCheck.reasons.push('Manual validation failed: ' + (notes || 'No reason provided'));
      }

      await claim.save();

      res.json(claim);
    } catch (error) {
      console.error('Validate claim error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = claimsController;