const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const workersController = require('../controllers/workersController');

// DEBUG (temporary)
console.log("authMiddleware:", typeof authMiddleware);
console.log("getProfile:", typeof workersController.getProfile);

// Routes
router.get('/profile', authMiddleware, workersController.getProfile);
router.put('/profile', authMiddleware, workersController.updateProfile);
router.post('/calculate-risk', authMiddleware, workersController.calculateRisk);
router.post('/purchase-policy', authMiddleware, workersController.purchasePolicy);
router.get('/policies', authMiddleware, workersController.getPolicies);
router.get('/claims', authMiddleware, workersController.getClaims);

module.exports = router;