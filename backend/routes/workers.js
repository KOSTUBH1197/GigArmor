const express = require('express');
const workersController = require('../controllers/workersController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get worker profile
router.get('/profile', workersController.getProfile);

// Update worker profile
router.put('/profile', workersController.updateProfile);

// Calculate risk score and premium
const authMiddleware = require('../middleware/auth');

router.post('/calculate-risk', authMiddleware, workersController.calculateRisk);

// Purchase policy
router.post('/purchase-policy', workersController.purchasePolicy);

// Get worker policies
router.get('/policies', workersController.getPolicies);

// Get worker claims
router.get('/claims', workersController.getClaims);

module.exports = router;