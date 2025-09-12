require('dotenv').config();
const app = require('./src/app');
const { PORT, NODE_ENV } = require('./src/config/config');

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api`);
  console.log('Press Ctrl+C to stop the server');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

// Handle SIGTERM (for Docker)
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});

module.exports = app;
