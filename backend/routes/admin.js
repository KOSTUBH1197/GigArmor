const express = require('express');
const adminController = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(auth, adminAuth);

// Get dashboard statistics
router.get('/dashboard', adminController.getDashboardStats);

// Get all users
router.get('/users', adminController.getAllUsers);

// Get fraud alerts
router.get('/fraud-alerts', adminController.getFraudAlerts);

// Get risk heatmap data
router.get('/risk-heatmap', adminController.getRiskHeatmap);

// Get revenue analytics
router.get('/analytics/revenue', adminController.getRevenueAnalytics);

// Get claims analytics
router.get('/analytics/claims', adminController.getClaimsAnalytics);

module.exports = router;