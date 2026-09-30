const http = require('http');
const port = process.env.PORT || 4000;
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/health') {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: 'ok', service: 'nexa-trade-api' }));
  }
  res.writeHead(200);
  res.end(JSON.stringify({ service: 'NEXA Trade API', message: 'API scaffold ready' }));
});
server.listen(port, () => console.log(`NEXA API listening on ${port}`));
