// Quick deployment test
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  // Serve index.html for all requests (simple SPA)
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Build not found. Please run build first.');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 Test server running on http://0.0.0.0:${PORT}`);
});