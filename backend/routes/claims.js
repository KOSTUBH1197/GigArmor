const express = require('express');
const claimsController = require('../controllers/claimsController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all claims (admin)
router.get('/', claimsController.getAllClaims);

// Get claims by worker
router.get('/worker/:workerId', claimsController.getClaimsByWorker);

// Get claim by ID
router.get('/:id', claimsController.getClaimById);

// Create claim
router.post('/', claimsController.createClaim);

// Update claim status
router.put('/:id/status', claimsController.updateClaimStatus);

// Process payout
router.post('/:id/payout', claimsController.processPayout);

// Validate claim (admin)
router.post('/:id/validate', claimsController.validateClaim);

module.exports = router;