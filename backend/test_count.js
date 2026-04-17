require('dotenv').config();
const db = require('./src/config/db');

async function test() {
  try {
    const qCheck = await db.execute({
      sql: "SELECT COUNT(*) as count FROM questions WHERE quiz_id = ?",
      args: [24]
    });
    console.log("qCheck:", qCheck);
    console.log("rows[0].count:", qCheck.rows[0].count);
    console.log("typeof count:", typeof qCheck.rows[0].count);
  } catch (err) {
    console.error(err);
  }
}

test();
