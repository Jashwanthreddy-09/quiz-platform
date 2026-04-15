const db = require('../config/db');

exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const upcomingExams = await db.execute({
      sql: `
        SELECT q.*, a.status as attempt_status 
        FROM quizzes q
        LEFT JOIN attempts a ON q.id = a.quiz_id AND a.user_id = ?
        WHERE q.status = 'published' 
        AND (q.end_time > datetime('now') OR q.end_time IS NULL)
        ORDER BY q.start_time ASC
      `,
      args: [userId]
    });

    // Past Results for this student
    const results = await db.execute({
      sql: `SELECT r.*, q.title as quiz_title, q.duration 
            FROM results r 
            JOIN quizzes q ON r.quiz_id = q.id 
            WHERE r.user_id = ? 
            ORDER BY r.completed_at DESC`,
      args: [userId]
    });

    // Mock Notifications
    const notifications = [
      { id: 1, text: "New Exam Released: JavaScript Advanced", type: 'new' },
      { id: 2, text: "Results are ready for: React Basics", type: 'result' }
    ];

    res.json({
      upcomingExams: upcomingExams.rows,
      results: results.rows,
      notifications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
