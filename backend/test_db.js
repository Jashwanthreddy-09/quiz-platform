const db = require('./src/config/db');

async function test() {
  try {
    const qCheck = await db.execute("SELECT * FROM questions");
    console.log("All questions:", qCheck.rows);
  } catch (err) {
    console.error(err);
  }
}

test();
