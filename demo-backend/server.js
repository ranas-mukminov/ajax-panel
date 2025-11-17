const http = require('http');

const PORT = 8080;

const server = http.createServer((req, res) => {
  // Enable CORS for Grafana
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url;

  if (url === '/api/demo/text') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Demo AJAX Panel Response\nServer time: ${new Date().toISOString()}\nRequest from: ${req.headers['host'] || 'unknown'}`);
  } 
  else if (url === '/api/demo/json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Hello from AJAX Demo Backend',
      timestamp: new Date().toISOString(),
      random_value: Math.floor(Math.random() * 100),
      server_uptime: process.uptime(),
      endpoints: {
        text: '/api/demo/text',
        json: '/api/demo/json',
        health: '/health'
      }
    }, null, 2));
  }
  else if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n\nAvailable endpoints:\n- /api/demo/text\n- /api/demo/json\n- /health');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Demo backend server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  - http://localhost:${PORT}/api/demo/text`);
  console.log(`  - http://localhost:${PORT}/api/demo/json`);
  console.log(`  - http://localhost:${PORT}/health`);
});
