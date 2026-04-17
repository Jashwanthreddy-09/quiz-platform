const initDb = require('./backend/src/models/initDb');

initDb().then(() => {
  console.log("Database schema reconciliation successful.");
  process.exit(0);
}).catch(err => {
  console.error("Database schema reconciliation failed:", err);
  process.exit(1);
});
