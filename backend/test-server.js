const express = require('express');
const cors = require('cors');

const app = express();
const port = 5002; // Using a different port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint hit!');
  res.json({ status: 'success', message: 'Test server is running!' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server is running on port ${port}`);
  console.log(`Test endpoint: http://localhost:${port}/test`);
}).on('error', (error) => {
  console.error('Failed to start test server:', error);
  process.exit(1);
});
