const fs = require('fs');

function loadClientConfig(clientName) {
  const config = JSON.parse(fs.readFileSync('./config/clients.config.json', 'utf8'));
  return config.clients[clientName];
}

module.exports = { loadClientConfig };