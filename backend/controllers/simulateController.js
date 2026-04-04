const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const User = require('../models/User');
const axios = require('axios');

const TRIGGER_CONFIGS = {
  rainfall: {
    value: 75,
    label: 'Heavy Rainfall',
    description: 'Rainfall exceeded 75mm in 24 hours',
    icon: '🌧️',
    payoutPercent: 0.7,
  },
  flood: {
    value: 1,
    label: 'Flood Alert',
    description: 'Active flood warning in your delivery zone',
    icon: '🌊',
    payoutPercent: 0.85,
  },
  aqi: {
    value: 380,
    label: 'Severe Air Pollution',
    description: 'AQI exceeded safe threshold (380+)',
    icon: '🏭',
    payoutPercent: 0.6,
  },
  temperature: {
    value: 46,
    label: 'Extreme Heat',
    description: 'Temperature exceeded 45°C — unsafe working conditions',
    icon: '🌡️',
    payoutPercent: 0.65,
  },
  curfew: {
    value: 1,
    label: 'Area Curfew',
    description: 'Local authority imposed movement restrictions',
    icon: '🚨',
    payoutPercent: 0.75,
  },
};

const simulateController = {
  /**
   * POST /api/workers/simulate-event
   * Body: { triggerType: 'rainfall' | 'flood' | 'aqi' | 'temperature' | 'curfew' }
   * Creates a real claim in the DB and returns it immediately for demo purposes.
   */
  simulateEvent: async (req, res) => {
    try {
      const { triggerType = 'rainfall' } = req.body;
      const userId = req.user.userId;

      const config = TRIGGER_CONFIGS[triggerType];
      if (!config) {
        return res.status(400).json({
          message: `Invalid trigger type. Valid options: ${Object.keys(TRIGGER_CONFIGS).join(', ')}`,
        });
      }

      // Get active policy for this worker
      const policy = await Policy.findOne({ workerId: userId, status: 'active' });
      if (!policy) {
        return res.status(400).json({
          message: 'No active policy found. Please purchase a policy first.',
          requiresPolicy: true,
        });
      }

      const user = await User.findById(userId);
      const triggerLocation = {
        latitude: user?.location?.latitude || 19.076,
        longitude: user?.location?.longitude || 72.877,
      };

      // Check for duplicate in last 1 hour (demo-friendly window)
      const recentClaim = await Claim.findOne({
        policyId: policy._id,
        'triggerEvent.type': triggerType,
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
      });

      if (recentClaim) {
        return res.status(409).json({
          message: 'A claim for this event already exists in the last hour.',
          existingClaim: recentClaim,
        });
      }

      const payoutAmount = Math.round(policy.coverageAmount * config.payoutPercent);

      // Run fraud check (graceful fallback)
      let fraudCheck = { passed: true, probability: 0.02, reasons: [] };
      try {
        const fraudRes = await axios.post(
          `${process.env.AI_SERVICE_URL}/check-fraud`,
          {
            workerId: userId,
            triggerEvent: { type: triggerType, value: config.value },
            location: triggerLocation,
          },
          { timeout: 5000 }
        );
        fraudCheck = fraudRes.data;
      } catch (err) {
        // Fallback: simulated events are assumed clean for demo
        console.warn('[SimulateEvent] Fraud check unavailable, using demo default');
      }

      // Create the claim
      const claim = new Claim({
        policyId: policy._id,
        workerId: userId,
        triggerEvent: {
          type: triggerType,
          value: config.value,
          location: triggerLocation,
          timestamp: new Date(),
        },
        payoutAmount,
        fraudCheck,
        status: fraudCheck.passed ? 'paid' : 'pending',
        paymentId: fraudCheck.passed ? `sim_payout_${Date.now()}` : undefined,
      });

      await claim.save();

      return res.status(201).json({
        success: true,
        message: `✅ ${config.label} detected! Claim auto-processed.`,
        claim: {
          _id: claim._id,
          status: claim.status,
          payoutAmount: claim.payoutAmount,
          trigger: {
            type: triggerType,
            label: config.label,
            description: config.description,
            icon: config.icon,
            value: config.value,
          },
          fraudCheck: {
            passed: claim.fraudCheck.passed,
            probability: claim.fraudCheck.probability,
          },
          processedAt: claim.createdAt,
          paymentId: claim.paymentId,
        },
        policy: {
          coverageAmount: policy.coverageAmount,
          weeklyPremium: policy.weeklyPremium,
        },
      });
    } catch (error) {
      console.error('[SimulateEvent] Error:', error);
      res.status(500).json({ message: 'Simulation failed. Please try again.' });
    }
  },

  /**
   * GET /api/workers/trigger-configs
   * Returns the list of available trigger types for the frontend.
   */
  getTriggerConfigs: async (req, res) => {
    res.json(TRIGGER_CONFIGS);
  },
};

module.exports = simulateController;
