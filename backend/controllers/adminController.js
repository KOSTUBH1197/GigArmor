const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');

const adminController = {
  // Get dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      // Basic counts
      const totalWorkers = await User.countDocuments({ role: 'worker' });
      const totalPolicies = await Policy.countDocuments({ status: 'active' });
      const totalClaims = await Claim.countDocuments();

      // Revenue calculations
      const activePolicies = await Policy.find({ status: 'active' });
      const weeklyRevenue = activePolicies.reduce((sum, policy) => sum + policy.weeklyPremium, 0);

      // Claims statistics
      const approvedClaims = await Claim.countDocuments({ status: 'approved' });
      const paidClaims = await Claim.countDocuments({ status: 'paid' });
      const pendingClaims = await Claim.countDocuments({ status: 'pending' });
      const rejectedClaims = await Claim.countDocuments({ status: 'rejected' });

      const claimsRatio = totalClaims > 0 ? ((approvedClaims + paidClaims) / totalClaims) * 100 : 0;

      // Fraud statistics
      const fraudClaims = await Claim.countDocuments({ 'fraudCheck.passed': false });
      const fraudRatio = totalClaims > 0 ? (fraudClaims / totalClaims) * 100 : 0;

      // Recent activity (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentPolicies = await Policy.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
      const recentClaims = await Claim.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

      // Risk distribution
      const highRiskWorkers = await User.countDocuments({ riskScore: { $gte: 70 } });
      const mediumRiskWorkers = await User.countDocuments({ riskScore: { $gte: 40, $lt: 70 } });
      const lowRiskWorkers = await User.countDocuments({ riskScore: { $lt: 40 } });

      res.json({
        overview: {
          totalWorkers,
          totalPolicies,
          totalClaims,
          weeklyRevenue: Math.round(weeklyRevenue),
          claimsRatio: Math.round(claimsRatio * 100) / 100,
          fraudRatio: Math.round(fraudRatio * 100) / 100,
        },
        claims: {
          total: totalClaims,
          approved: approvedClaims,
          paid: paidClaims,
          pending: pendingClaims,
          rejected: rejectedClaims,
        },
        recentActivity: {
          policiesLast7Days: recentPolicies,
          claimsLast7Days: recentClaims,
        },
        riskDistribution: {
          high: highRiskWorkers,
          medium: mediumRiskWorkers,
          low: lowRiskWorkers,
        }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get all users with pagination
  getAllUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments();

      res.json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get fraud alerts
  getFraudAlerts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const fraudClaims = await Claim.find({ 'fraudCheck.passed': false })
        .populate('workerId', 'name email phone')
        .populate('policyId', 'weeklyPremium coverageAmount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Claim.countDocuments({ 'fraudCheck.passed': false });

      res.json({
        fraudAlerts: fraudClaims,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get fraud alerts error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get risk heatmap data
  getRiskHeatmap: async (req, res) => {
    try {
      const workers = await User.find({ role: 'worker' })
        .select('name location riskScore deliveryPlatform averageWeeklyIncome')
        .sort({ riskScore: -1 });

      const heatmapData = workers.map(worker => ({
        id: worker._id,
        name: worker.name,
        location: worker.location,
        riskScore: worker.riskScore || 0,
        deliveryPlatform: worker.deliveryPlatform,
        income: worker.averageWeeklyIncome,
      }));

      res.json(heatmapData);
    } catch (error) {
      console.error('Get risk heatmap error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get revenue analytics
  getRevenueAnalytics: async (req, res) => {
    try {
      const { period = 'weekly' } = req.query;

      let dateRange;
      const now = new Date();

      switch (period) {
        case 'daily':
          dateRange = 1;
          break;
        case 'weekly':
          dateRange = 7;
          break;
        case 'monthly':
          dateRange = 30;
          break;
        default:
          dateRange = 7;
      }

      const startDate = new Date(now.getTime() - dateRange * 24 * 60 * 60 * 1000);

      // Get policies created in the period
      const policies = await Policy.find({
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 });

      // Calculate cumulative revenue
      let cumulativeRevenue = 0;
      const revenueData = policies.map(policy => {
        cumulativeRevenue += policy.weeklyPremium;
        return {
          date: policy.createdAt.toISOString().split('T')[0],
          revenue: policy.weeklyPremium,
          cumulative: cumulativeRevenue
        };
      });

      res.json({
        period,
        totalRevenue: cumulativeRevenue,
        data: revenueData
      });
    } catch (error) {
      console.error('Get revenue analytics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get claims analytics
  getClaimsAnalytics: async (req, res) => {
    try {
      const { period = 'weekly' } = req.query;

      let dateRange;
      const now = new Date();

      switch (period) {
        case 'daily':
          dateRange = 1;
          break;
        case 'weekly':
          dateRange = 7;
          break;
        case 'monthly':
          dateRange = 30;
          break;
        default:
          dateRange = 7;
      }

      const startDate = new Date(now.getTime() - dateRange * 24 * 60 * 60 * 1000);

      const claims = await Claim.find({
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 });

      // Group by trigger type
      const triggerStats = {};
      claims.forEach(claim => {
        const trigger = claim.triggerEvent.type;
        if (!triggerStats[trigger]) {
          triggerStats[trigger] = { count: 0, totalPayout: 0 };
        }
        triggerStats[trigger].count++;
        triggerStats[trigger].totalPayout += claim.payoutAmount;
      });

      res.json({
        period,
        totalClaims: claims.length,
        triggerStats,
        claimsByStatus: {
          pending: claims.filter(c => c.status === 'pending').length,
          approved: claims.filter(c => c.status === 'approved').length,
          paid: claims.filter(c => c.status === 'paid').length,
          rejected: claims.filter(c => c.status === 'rejected').length,
        }
      });
    } catch (error) {
      console.error('Get claims analytics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = adminController;