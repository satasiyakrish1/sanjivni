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
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  
  // OpenAI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

  // Google AI (Gemini) Configuration
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100, // Limit each IP to 100 requests per windowMs
};

// Log configuration status
if (!config.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not defined - OpenAI provider disabled');
} else {
  console.log('OpenAI API key configured');
}

if (!config.GOOGLE_API_KEY) {
  console.warn('WARNING: GOOGLE_API_KEY is not defined - Google Gemini provider disabled');
} else {
  console.log('Google Gemini API key configured');
}

module.exports = config;
