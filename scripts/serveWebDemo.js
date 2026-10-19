const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HTML_FILE = path.join(__dirname, '..', 'SPBF_Mobile_Interactive_Demo.html');

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  // Serve the interactive demo for any page request
  fs.readFile(HTML_FILE, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading demo: ' + err.message);
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`  SPBF Mobile Interactive Demo Server Running!`);
  console.log(`  Local URL:   http://localhost:${PORT}`);
  console.log(`  LAN URL:     http://172.20.10.5:${PORT}`);
  console.log(`====================================================`);
});
