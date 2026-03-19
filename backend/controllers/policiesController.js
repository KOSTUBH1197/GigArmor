const Policy = require('../models/Policy');
const User = require('../models/User');

const policiesController = {
  // Get all policies (admin)
  getAllPolicies: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const policies = await Policy.find()
        .populate('workerId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Policy.countDocuments();

      res.json({
        policies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all policies error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get policy by ID
  getPolicyById: async (req, res) => {
    try {
      const policy = await Policy.findById(req.params.id)
        .populate('workerId', 'name email phone location');

      if (!policy) {
        return res.status(404).json({ message: 'Policy not found' });
      }

      res.json(policy);
    } catch (error) {
      console.error('Get policy by ID error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Create policy (admin or worker)
  createPolicy: async (req, res) => {
    try {
      const { workerId, weeklyPremium, coverageAmount, startDate, endDate } = req.body;

      // If not admin, can only create for themselves
      if (req.user.role !== 'admin' && req.user.userId !== workerId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const user = await User.findById(workerId);
      if (!user) {
        return res.status(404).json({ message: 'Worker not found' });
      }

      const policy = new Policy({
        workerId,
        weeklyPremium,
        coverageAmount,
        startDate: startDate || new Date(),
        endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await policy.save();

      res.status(201).json(policy);
    } catch (error) {
      console.error('Create policy error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update policy
  updatePolicy: async (req, res) => {
    try {
      const updates = req.body;
      const allowedUpdates = ['weeklyPremium', 'coverageAmount', 'status', 'endDate'];

      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      const policy = await Policy.findByIdAndUpdate(
        req.params.id,
        filteredUpdates,
        { new: true, runValidators: true }
      ).populate('workerId', 'name email');

      if (!policy) {
        return res.status(404).json({ message: 'Policy not found' });
      }

      res.json(policy);
    } catch (error) {
      console.error('Update policy error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete policy
  deletePolicy: async (req, res) => {
    try {
      const policy = await Policy.findById(req.params.id);

      if (!policy) {
        return res.status(404).json({ message: 'Policy not found' });
      }

      // Only admin can delete policies
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      await Policy.findByIdAndDelete(req.params.id);

      res.json({ message: 'Policy deleted successfully' });
    } catch (error) {
      console.error('Delete policy error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get policies by worker
  getPoliciesByWorker: async (req, res) => {
    try {
      const { workerId } = req.params;

      // Check permissions
      if (req.user.role !== 'admin' && req.user.userId !== workerId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const policies = await Policy.find({ workerId })
        .sort({ createdAt: -1 });

      res.json(policies);
    } catch (error) {
      console.error('Get policies by worker error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Calculate premium for worker
  calculatePremium: async (req, res) => {
    try {
      const { workerId } = req.params;

      const user = await User.findById(workerId);
      if (!user) {
        return res.status(404).json({ message: 'Worker not found' });
      }

      // Base premium calculation
      const basePremium = 50; // Base weekly premium
      const riskMultiplier = user.riskScore ? user.riskScore / 100 : 0.5;
      const weeklyPremium = basePremium + (riskMultiplier * 100);

      // Coverage: 70% of average weekly income
      const coverageAmount = user.averageWeeklyIncome * 0.7;

      res.json({
        workerId,
        basePremium,
        riskMultiplier,
        weeklyPremium: Math.round(weeklyPremium),
        coverageAmount: Math.round(coverageAmount)
      });
    } catch (error) {
      console.error('Calculate premium error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = policiesController;