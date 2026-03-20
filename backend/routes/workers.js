const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const workersController = require('../controllers/workersController');

// ❌ REMOVE THIS LINE
// router.use(auth);

// Get worker profile
router.get('/profile', authMiddleware, workersController.getProfile);

// Update worker profile
router.put('/profile', authMiddleware, workersController.updateProfile);

// Calculate risk score and premium
router.post('/calculate-risk', authMiddleware, workersController.calculateRisk);

// Purchase policy
router.post('/purchase-policy', authMiddleware, workersController.purchasePolicy);

// Get worker policies
router.get('/policies', authMiddleware, workersController.getPolicies);

// Get worker claims
router.get('/claims', authMiddleware, workersController.getClaims);

module.exports = router;