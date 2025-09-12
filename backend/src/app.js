const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { CORS_ORIGINS } = require('./config/config');
const apiRoutes = require('./routes/api');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// Enable CORS with specific origins including Vercel subdomains
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    try {
      const hostname = new URL(origin).hostname;
      const isAllowed =
        CORS_ORIGINS.includes(origin) ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.endsWith('.vercel.app');
      return callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
    } catch (e) {
      return callback(new Error('Invalid origin'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Parse JSON bodies
app.use(express.json({ limit: '10kb' }));

// Root health check for platforms that route root to the function
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Herbal AI API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
