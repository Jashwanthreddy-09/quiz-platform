const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const examsCount = await db.execute("SELECT COUNT(*) as count FROM quizzes");
    const studentsCount = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const submissionsCount = await db.execute("SELECT COUNT(*) as count FROM results");
    
    const recentExams = await db.execute(`
      SELECT q.*, (SELECT COUNT(*) FROM results WHERE quiz_id = q.id) as submissions
      FROM quizzes q ORDER BY created_at DESC LIMIT 5
    `);

    // Mock chart data for submission trends (In real app, group by date from results table)
    const trends = [
      { name: 'Mon', submissions: 12 },
      { name: 'Tue', submissions: 19 },
      { name: 'Wed', submissions: 15 },
      { name: 'Thu', submissions: 22 },
      { name: 'Fri', submissions: 30 },
      { name: 'Sat', submissions: 10 },
      { name: 'Sun', submissions: 8 },
    ];

    res.json({
      stats: {
        totalExams: examsCount.rows[0].count,
        totalStudents: studentsCount.rows[0].count,
        totalSubmissions: submissionsCount.rows[0].count
      },
      recentExams: recentExams.rows,
      trends
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetStudentAttempt = async (req, res) => {
  try {
    const { userId, quizId } = req.body;
    
    await db.execute({
      sql: "DELETE FROM results WHERE user_id = ? AND quiz_id = ?",
      args: [userId, quizId]
    });

    const attempts = await db.execute({
      sql: "SELECT id FROM attempts WHERE user_id = ? AND quiz_id = ?",
      args: [userId, quizId]
    });

    for (let a of attempts.rows) {
      await db.execute({ sql: "DELETE FROM attempt_answers WHERE attempt_id = ?", args: [a.id] });
    }

    await db.execute({
      sql: "DELETE FROM attempts WHERE user_id = ? AND quiz_id = ?",
      args: [userId, quizId]
    });

    res.json({ message: "Attempt reset successfully. Student can now retake the exam." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
