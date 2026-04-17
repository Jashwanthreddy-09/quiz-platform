const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const examsCount = await db.execute("SELECT COUNT(*) as count FROM quizzes");
    const studentsCount = await db.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const submissionsCount = await db.execute("SELECT COUNT(*) as count FROM results");
    
    const recentSubmissions = await db.execute(`
      SELECT r.*, u.name as student_name, q.title as quiz_title
      FROM results r 
      JOIN users u ON r.user_id = u.id 
      JOIN quizzes q ON r.quiz_id = q.id 
      ORDER BY r.completed_at DESC LIMIT 6
    `);

    const upcomingExams = await db.execute(`
      SELECT * FROM quizzes 
      WHERE start_time > CURRENT_TIMESTAMP 
      AND status = 'published'
      ORDER BY start_time ASC LIMIT 5
    `);

    // Dynamic submission trends from actual database results
    const trendsRes = await db.execute(`
      SELECT strftime('%m-%d', completed_at) as name, COUNT(*) as submissions 
      FROM results 
      WHERE completed_at >= date('now', '-7 days')
      GROUP BY name
      ORDER BY name ASC
    `);

    res.json({
      stats: {
        totalExams: examsCount.rows[0].count,
        totalStudents: studentsCount.rows[0].count,
        totalSubmissions: submissionsCount.rows[0].count
      },
      recentSubmissions: recentSubmissions.rows,
      upcomingExams: upcomingExams.rows,
      trends: trendsRes.rows.length > 0 ? trendsRes.rows : [
        { name: 'Mon', submissions: 0 }, { name: 'Tue', submissions: 0 },
        { name: 'Wed', submissions: 0 }, { name: 'Thu', submissions: 0 },
        { name: 'Fri', submissions: 0 }, { name: 'Sat', submissions: 0 },
        { name: 'Sun', submissions: 0 }
      ]
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
exports.getStudents = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT 
        u.id, u.name, u.email, u.created_at,
        COUNT(r.id) as exams_taken,
        ROUND(AVG(r.score), 1) as avg_score
      FROM users u
      LEFT JOIN results r ON u.id = r.user_id
      WHERE u.role = 'student'
    `;
    const args = [];

    if (search) {
      sql += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
      args.push(`%${search}%`, `%${search}%`);
    }

    sql += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const students = await db.execute({ sql, args });
    res.json(students.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDifficultQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Find questions where the student's answer doesn't match the correct answer
    // Note: requires joining with correct_answer from questions table
    const result = await db.execute({
      sql: `
        SELECT 
          q.id, q.text, q.type,
          COUNT(aa.id) as total_attempts,
          COUNT(CASE WHEN aa.answer != q.correct_answer THEN 1 END) as incorrect_count
        FROM questions q
        JOIN attempt_answers aa ON q.id = aa.question_id
        WHERE q.quiz_id = ?
        GROUP BY q.id
        HAVING incorrect_count > 0
        ORDER BY incorrect_count DESC
        LIMIT 5
      `,
      args: [quizId]
    });
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuizAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Basic Quiz Info
    const quiz = await db.execute({
      sql: "SELECT title, passing_percentage FROM quizzes WHERE id = ?",
      args: [id]
    });

    if (quiz.rows.length === 0) return res.status(404).json({ error: "Quiz not found" });

    // 2. Summary Stats
    const summaryRes = await db.execute({
      sql: `SELECT 
              COUNT(*) as totalAttempts,
              ROUND(AVG(score), 1) as averageScore,
              MAX(score) as highestScore,
              COUNT(CASE WHEN score >= ? THEN 1 END) as passedCount
            FROM results WHERE quiz_id = ?`,
      args: [quiz.rows[0].passing_percentage, id]
    });

    const summary = summaryRes.rows[0];
    const passRate = summary.totalAttempts > 0 
      ? Math.round((summary.passedCount / summary.totalAttempts) * 100) 
      : 0;

    // 3. Score Distribution
    const distribution = [
      { name: '0-20', count: 0 }, { name: '21-40', count: 0 },
      { name: '41-60', count: 0 }, { name: '61-80', count: 0 },
      { name: '81-100', count: 0 }
    ];

    const scores = await db.execute({
      sql: "SELECT score FROM results WHERE quiz_id = ?",
      args: [id]
    });

    scores.rows.forEach(r => {
      const s = r.score;
      if (s <= 20) distribution[0].count++;
      else if (s <= 40) distribution[1].count++;
      else if (s <= 60) distribution[2].count++;
      else if (s <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    // 4. Student Roster
    const roster = await db.execute({
      sql: `SELECT 
              u.name as student_name,
              u.email as student_email,
              r.score,
              r.time_taken,
              r.completed_at
            FROM results r
            JOIN users u ON r.user_id = u.id
            WHERE r.quiz_id = ?
            ORDER BY r.completed_at DESC`,
      args: [id]
    });

    res.json({
      quizTitle: quiz.rows[0].title,
      quizPassingPercentage: quiz.rows[0].passing_percentage,
      summary: {
        ...summary,
        passRate
      },
      distribution,
      roster: roster.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGlobalAnalytics = async (req, res) => {
  try {
    // This is a simplified version. In a real app we'd aggregate by Day/Category.
    const trends = [
      { name: 'Mon', active: 45, completions: 32 },
      { name: 'Tue', active: 52, completions: 41 },
      { name: 'Wed', active: 48, completions: 38 },
      { name: 'Thu', active: 61, completions: 50 },
      { name: 'Fri', active: 55, completions: 44 },
      { name: 'Sat', active: 32, completions: 20 },
      { name: 'Sun', active: 28, completions: 15 },
    ];

    const distributionRes = await db.execute(`
      SELECT 'Technical' as name, COUNT(*) as value FROM quizzes WHERE title LIKE '%Tech%'
      UNION
      SELECT 'Aptitude' as name, COUNT(*) as value FROM quizzes WHERE title LIKE '%Aptitude%'
      UNION
      SELECT 'Coding' as name, COUNT(*) as value FROM quizzes WHERE title LIKE '%Code%'
    `);

    res.json({
      trends,
      distribution: distributionRes.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
