const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * Rate limiter for authentication endpoints
 * Prevents brute-force attacks on login/register endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to authentication routes
router.use(authLimiter);

// Health check / API info endpoint (no rate limit)
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'GigArmor Auth API',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/auth/register
 * Register a new worker user
 * @body {string} name - User's full name
 * @body {string} email - User's email (unique)
 * @body {string} password - User's password
 * @body {string} phone - User's phone number
 * @body {string} location - User's location
 * @body {string} deliveryPlatform - Delivery platform name
 * @body {number} averageWeeklyIncome - Average weekly income
 * @returns {object} Token and user object
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * @body {string} email - User's email
 * @body {string} password - User's password
 * @returns {object} Token and user object
 */
router.post('/login', authController.login);

// 404 handler for undefined auth routes
router.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handling middleware for this router
router.use((err, req, res, next) => {
  console.error('Auth router error:', err);
  res.status(500).json({
    message: 'Internal server error in auth module'
  });
});

// Export router with metadata for debugging/validation
module.exports = router;