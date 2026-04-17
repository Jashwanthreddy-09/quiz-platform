const db = require('../config/db');

exports.getQuizLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;

    const result = await db.execute({
      sql: `SELECT 
              r.score, 
              r.time_taken, 
              r.completed_at, 
              u.name as student_name,
              u.id as user_id
            FROM results r
            JOIN users u ON r.user_id = u.id
            WHERE r.quiz_id = ?
            ORDER BY r.score DESC, r.time_taken ASC, r.completed_at ASC
            LIMIT 50`,
      args: [quizId]
    });

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGlobalLeaderboard = async (req, res) => {
  try {
    // Global ranking based on average score across all quizzes
    const result = await db.execute(`
      SELECT 
        u.name as student_name,
        ROUND(AVG(r.score), 1) as score,
        COUNT(r.id) as quizzes_taken
      FROM users u
      JOIN results r ON u.id = r.user_id
      GROUP BY u.id
      ORDER BY score DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
