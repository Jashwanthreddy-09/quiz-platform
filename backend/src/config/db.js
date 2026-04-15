console.log("Running DB init...");
require('dotenv').config();
const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});
console.log("Connected to:", process.env.TURSO_DB_URL);

module.exports = db;