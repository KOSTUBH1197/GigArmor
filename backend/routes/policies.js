const express = require('express');
const policiesController = require('../controllers/policiesController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all policies (admin)
router.get('/', policiesController.getAllPolicies);

// Get policy by ID
router.get('/:id', policiesController.getPolicyById);

// Create policy
router.post('/', policiesController.createPolicy);

// Update policy
router.put('/:id', policiesController.updatePolicy);

// Delete policy
router.delete('/:id', policiesController.deletePolicy);

// Get policies by worker
router.get('/worker/:workerId', policiesController.getPoliciesByWorker);

// Calculate premium for worker
router.get('/calculate/:workerId', policiesController.calculatePremium);

module.exports = router;