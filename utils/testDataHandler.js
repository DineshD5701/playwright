// utils/testDataHandler.js
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/testData.json');

function readTestData() {
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(rawData);
}

function updateTicketID(clientName, ticketID) {
  const data = readTestData();
  if (!data[clientName]) {
    data[clientName] = {};
  }
  data[clientName].ticketID = ticketID;
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { updateTicketID, readTestData };
