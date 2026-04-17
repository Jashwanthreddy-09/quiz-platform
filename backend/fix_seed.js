const db = require('./src/config/db'); 
async function run() { 
  try {
    const quizzes = await db.execute('SELECT id FROM quizzes');
    for (let q of quizzes.rows) {
      let check = await db.execute({sql: 'SELECT COUNT(*) as c FROM questions WHERE quiz_id = ?', args: [q.id]});
      if (check.rows[0].c === 0) {
        await db.execute({
          sql: "INSERT INTO questions (quiz_id, type, text, options, correct_answer, marks) VALUES (?, 'mcq', 'What is 2+2?', '[\"3\",\"4\",\"5\"]', '4', 10)", 
          args: [q.id]
        });
        await db.execute({
          sql: "INSERT INTO questions (quiz_id, type, text, correct_answer, marks) VALUES (?, 'short_answer', 'Explain gravity.', 'Gravity is a force.', 10)", 
          args: [q.id]
        });
      }
    }
    console.log('Seeded questions');
  } catch(e) {
    console.error(e);
  }
} 
run();
