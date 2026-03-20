const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const workersController = require('../controllers/workersController');

// Get worker profile
router.get('/profile', authMiddleware, workersController.getProfile);

// Update worker profile
router.put('/profile', authMiddleware, workersController.updateProfile);

// Calculate risk
router.post('/calculate-risk', authMiddleware, workersController.calculateRisk);

// Purchase policy
router.post('/purchase-policy', authMiddleware, workersController.purchasePolicy);

// Policies
router.get('/policies', authMiddleware, workersController.getPolicies);

// Claims
router.get('/claims', authMiddleware, workersController.getClaims);

module.exports = router;