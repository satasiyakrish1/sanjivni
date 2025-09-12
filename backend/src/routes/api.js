const express = require('express');
const { getHerbalRemedyHandler } = require('../controllers/herbalRemedyController');
const { validateRequest } = require('../middleware/validation');
const { rateLimit } = require('express-rate-limit');
const { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } = require('../config/config');

const router = express.Router();

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Herbal AI API is running',
    timestamp: new Date().toISOString()
  });
});

// Herbal remedy endpoint with rate limiting
router.post('/herbal-remedy', apiLimiter, validateRequest, getHerbalRemedyHandler);

module.exports = router;
