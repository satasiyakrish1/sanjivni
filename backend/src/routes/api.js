const express = require('express');
const { getHerbalRemedyHandler, getHerbInfoHandler } = require('../controllers/herbalRemedyController');
const axios = require('axios');
const translate = require('google-translate-api-x');
const { validateRequest, herbalRemedyValidationRules } = require('../middleware/validation');
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

// Herbal remedy endpoint with rate limiting and validation
router.post('/herbal-remedy', apiLimiter, herbalRemedyValidationRules, validateRequest, getHerbalRemedyHandler);

// Herb info endpoint (short queries like "benefits of ginger")
router.post('/herb-info', apiLimiter, getHerbInfoHandler);

// Translation proxy (to avoid browser CORS with Lingva)
router.get('/translate', apiLimiter, async (req, res) => {
  try {
    const source = (req.query.source || 'auto').toString();
    const target = (req.query.target || '').toString();
    const text = (req.query.text || '').toString();

    if (!target) {
      return res.status(400).json({ error: 'Missing target language code' });
    }
    if (!text) {
      return res.status(400).json({ error: 'Missing text to translate' });
    }

    // Prefer server-side translation to avoid flaky third-party proxies
    const result = await translate(text, { from: source, to: target });
    return res.status(200).json({ translation: result?.text || '' });
  } catch (err) {
    const status = err?.response?.status || 500;
    const errorMessage = err?.response?.data?.error || 'Translation service error';
    return res.status(status >= 400 && status < 600 ? status : 500).json({ error: errorMessage });
  }
});

// POST translation (preferred for long texts)
router.post('/translate', apiLimiter, async (req, res) => {
  try {
    const body = req.body || {};
    const source = (body.source || 'auto').toString();
    const target = (body.target || '').toString();
    const text = (body.text || '').toString();

    if (!target) {
      return res.status(400).json({ error: 'Missing target language code' });
    }
    if (!text) {
      return res.status(400).json({ error: 'Missing text to translate' });
    }

    const result = await translate(text, { from: source, to: target });
    return res.status(200).json({ translation: result?.text || '' });
  } catch (err) {
    const status = err?.response?.status || 500;
    const errorMessage = err?.response?.data?.error || 'Translation service error';
    return res.status(status >= 400 && status < 600 ? status : 500).json({ error: errorMessage });
  }
});

module.exports = router;
