const db = require('../config/db');

exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Upcoming Exams
    const upcomingExams = await db.execute({
      sql: `
        SELECT q.id, q.title, q.start_time, q.duration, q.status, a.status as attempt_status 
        FROM quizzes q
        LEFT JOIN attempts a ON q.id = a.quiz_id AND a.user_id = ?
        WHERE q.status = 'published' 
        AND (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) > 0
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

    // Calculate Real Stats
    const totalPointsRes = await db.execute({
      sql: "SELECT SUM(score) as total FROM results WHERE user_id = ?",
      args: [userId]
    });
    const totalPoints = totalPointsRes.rows[0]?.total || 0;

    const rankRes = await db.execute({
      sql: `
        SELECT user_id, SUM(score) as total_score 
        FROM results 
        GROUP BY user_id 
        ORDER BY total_score DESC
      `
    });
    const rank = rankRes.rows.findIndex(r => r.user_id === userId) + 1 || '-';

    // Real Notifications
    const notificationsRes = await db.execute({
      sql: "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
      args: [userId]
    });

    res.json({
      upcomingExams: upcomingExams.rows,
      results: results.rows,
      stats: {
        ranking: rank,
        points: totalPoints
      },
      notifications: notificationsRes.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
