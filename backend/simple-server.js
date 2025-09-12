const http = require('http');

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/test' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'success', message: 'Test server is working!' }));
    return;
  }

  if (req.url === '/api/herbal-remedy' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('Received request with body:', body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        remedy: "## Test Herbal Remedy\n- **Symptom**: Test symptom\n- **Remedy**: This is a test response from the server"
      }));
    });
    
    return;
  }

  res.writeHead(404);
  res.end('Not Found');});

const PORT = 5003;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log('Test endpoints:');
  console.log(`- GET  http://localhost:${PORT}/test`);
  console.log(`- POST http://localhost:${PORT}/api/herbal-remedy`);
});

// Handle errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});
