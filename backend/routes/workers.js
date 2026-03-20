const express = require('express');
const router = express.Router();

// 👇 IMPORTANT CHANGE
const { auth } = require('../middleware/auth');

const workersController = require('../controllers/workersController');

// Routes
router.get('/profile', auth, workersController.getProfile);
router.put('/profile', auth, workersController.updateProfile);
router.post('/calculate-risk', auth, workersController.calculateRisk);
router.post('/purchase-policy', auth, workersController.purchasePolicy);
router.get('/policies', auth, workersController.getPolicies);
router.get('/claims', auth, workersController.getClaims);

module.exports = router;