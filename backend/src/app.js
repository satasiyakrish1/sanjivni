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

// Enable CORS with specific origins
app.use(cors({
  origin: CORS_ORIGINS,
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

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
