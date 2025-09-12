const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Environment variables with defaults
const config = {
  // Server configuration
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS configuration
  CORS_ORIGINS: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  
  // Google AI Configuration
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY || '',
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100, // Limit each IP to 100 requests per windowMs
};

// Validate required configurations
if (!config.GOOGLE_AI_API_KEY) {
  console.error('FATAL ERROR: GOOGLE_AI_API_KEY is not defined');
  process.exit(1);
}

module.exports = config;
