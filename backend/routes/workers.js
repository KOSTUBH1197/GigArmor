const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth');
const workersController = require('../controllers/workersController');
const simulateController = require('../controllers/simulateController');

// Core worker routes
router.get('/profile', auth, workersController.getProfile);
router.put('/profile', auth, workersController.updateProfile);
router.post('/calculate-risk', auth, workersController.calculateRisk);
router.post('/purchase-policy', auth, workersController.purchasePolicy);
router.get('/policies', auth, workersController.getPolicies);
router.get('/claims', auth, workersController.getClaims);

// Demo / simulation routes
router.post('/simulate-event', auth, simulateController.simulateEvent);
router.get('/trigger-configs', auth, simulateController.getTriggerConfigs);

module.exports = router;