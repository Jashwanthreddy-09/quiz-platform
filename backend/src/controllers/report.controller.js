const db = require('../config/db');

exports.exportQuizResults = async (req, res) => {
  try {
    const { id: quizId } = req.params;

    const quiz = await db.execute({
      sql: "SELECT title FROM quizzes WHERE id = ?",
      args: [quizId]
    });

    if (!quiz.rows.length) return res.status(404).json({ error: "Quiz not found" });

    const results = await db.execute({
      sql: `SELECT 
              u.name, 
              u.email, 
              r.score, 
              r.total_questions, 
              r.time_taken, 
              r.completed_at 
            FROM results r
            JOIN users u ON r.user_id = u.id
            WHERE r.quiz_id = ?
            ORDER BY r.score DESC`,
      args: [quizId]
    });

    // Generate CSV string
    const headers = ['Student Name', 'Email', 'Score (%)', 'Total questions', 'Time Taken (s)', 'Completion Date'];
    const rows = results.rows.map(r => [
      r.name,
      r.email,
      r.score,
      r.total_questions,
      r.time_taken,
      r.completed_at
    ]);

    const csvRows = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Quiz_Results_${quiz.rows[0].title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    res.status(200).send(csvRows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
