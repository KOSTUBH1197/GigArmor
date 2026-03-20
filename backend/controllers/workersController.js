const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const axios = require('axios');

const workersController = {
  // Get worker profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update worker profile
  updateProfile: async (req, res) => {
    try {
      const updates = req.body;
      const allowedUpdates = ['name', 'phone', 'location', 'deliveryPlatform', 'averageWeeklyIncome'];

      // Filter allowed updates
      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        filteredUpdates,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Calculate risk score and premium
  



  calculateRisk: async (req, res) => {
    try {
      // 🔥 Step 1: JWT se userId nikalo
      const userId = req.user.userId;

      // 🔥 Step 2: DB se full user fetch karo
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("FULL USER:", user);

      // 🔥 Step 3: AI service call
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL}/calculate-risk`,
        {
          location: {
            latitude: Number(user.location?.latitude) || 19.0760,
            longitude: Number(user.location?.longitude) || 72.8777,
          },
          deliveryPlatform: user.deliveryPlatform,
          averageWeeklyIncome: user.averageWeeklyIncome,
        }
      );

      // 🔥 Step 4: response bhejo frontend ko
      res.json(aiResponse.data);

    } catch (error) {
      console.error("Risk error:", error.message);
      res.status(500).json({ message: "Risk calculation failed" });
    }
  },
    
  // Purchase policy
  purchasePolicy: async (req, res) => {
    try {
      const { weeklyPremium, coverageAmount } = req.body;

      if (!weeklyPremium || !coverageAmount) {
        return res.status(400).json({ message: 'Weekly premium and coverage amount required' });
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user already has an active policy
      const existingPolicy = await Policy.findOne({
        workerId: req.user.userId,
        status: 'active'
      });

      if (existingPolicy) {
        return res.status(400).json({ message: 'User already has an active policy' });
      }

      const policy = new Policy({
        workerId: req.user.userId,
        weeklyPremium,
        coverageAmount,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        riskFactors: {
          weatherRisk: 0,
          pollutionRisk: 0,
          floodRisk: 0,
          locationRisk: 0,
        },
      });

      await policy.save();

      // Mock payment processing
      policy.status = 'active';
      await policy.save();

      res.status(201).json({
        policy,
        message: 'Policy purchased successfully'
      });
    } catch (error) {
      console.error('Purchase policy error:', error);
      res.status(500).json({ message: 'Server error during policy purchase' });
    }
  },

  // Get worker policies
  getPolicies: async (req, res) => {
    try {
      const policies = await Policy.find({ workerId: req.user.userId })
        .sort({ createdAt: -1 });

      res.json(policies);
    } catch (error) {
      console.error('Get policies error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get worker claims
  getClaims: async (req, res) => {
    try {
      const claims = await Claim.find({ workerId: req.user.userId })
        .populate('policyId', 'weeklyPremium coverageAmount')
        .sort({ createdAt: -1 });

      res.json(claims);
    } catch (error) {
      console.error('Get claims error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = workersController;