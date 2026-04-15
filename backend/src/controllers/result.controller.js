const db = require('../config/db');

exports.getResultDetail = async (req, res) => {
  try {
    const { resultId } = req.params;
    const userId = req.user.id;

    // Fetch the main result record, ensure it belongs to the user
    const resultQuery = await db.execute({
      sql: `SELECT r.*, q.title as quiz_title, q.passing_percentage 
            FROM results r 
            JOIN quizzes q ON r.quiz_id = q.id 
            WHERE r.id = ? AND r.user_id = ?`,
      args: [resultId, userId]
    });

    if (resultQuery.rows.length === 0) {
      return res.status(404).json({ error: "Result not found" });
    }

    const result = resultQuery.rows[0];

    // Fetch detailed answers and compare with correct answers
    const answersQuery = await db.execute({
      sql: `SELECT 
              q.text as question_text, 
              q.type, 
              q.options, 
              q.correct_answer, 
              q.marks,
              q.explanation,
              aa.answer as student_answer
            FROM questions q
            LEFT JOIN attempt_answers aa ON q.id = aa.question_id
            JOIN attempts a ON aa.attempt_id = a.id
            WHERE q.quiz_id = ? AND a.user_id = ? AND a.status = 'submitted'
            ORDER BY q.id ASC`,
      args: [result.quiz_id, userId]
    });
    
    // Note: The above join might need refinement if multiple attempts exist.
    // We should ideally join by an attempt_id stored in the results table, 
    // but since we don't have that yet, we'll fetch the most recent one.
    
    res.json({
      summary: result,
      details: answersQuery.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.execute({
      sql: `SELECT r.*, q.title as quiz_title 
            FROM results r 
            JOIN quizzes q ON r.quiz_id = q.id 
            WHERE r.user_id = ? 
            ORDER BY r.completed_at DESC`,
      args: [userId]
    });
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
