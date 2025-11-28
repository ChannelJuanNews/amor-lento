const localtunnel = require('localtunnel');

(async () => {
  const tunnel = await localtunnel({ port: 3000 });

  console.log('Tunnel URL:', tunnel.url);

  tunnel.on('close', () => {
    console.log('Tunnel closed');
  });

  // Keep the process running
  process.on('SIGINT', () => {
    tunnel.close();
    process.exit();
  });

  // Keep alive
  setInterval(() => {}, 1000);
})();
