const db = require('../config/db');

exports.getQuizAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quizRes = await db.execute({
      sql: "SELECT * FROM quizzes WHERE id = ?",
      args: [quizId]
    });
    
    if (quizRes.rows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    const quiz = quizRes.rows[0];

    const resultsTable = await db.execute({
      sql: `SELECT 
              r.score, 
              r.time_taken, 
              r.completed_at, 
              u.name as student_name, 
              u.email as student_email
            FROM results r
            JOIN users u ON r.user_id = u.id
            WHERE r.quiz_id = ?
            ORDER BY r.score DESC, r.time_taken ASC`,
      args: [quizId]
    });

    const results = resultsTable.rows;

    let averageScore = 0;
    let highestScore = 0;
    let passedCount = 0;
    
    // Distribution: 0-10%, 10-20%, ... 90-100%
    const distribution = Array(10).fill(0).map((_, i) => ({ 
      name: `${i*10}-${(i+1)*10}%`, 
      count: 0 
    }));

    if (results.length > 0) {
      let total = 0;
      results.forEach(r => {
        total += r.score;
        if (r.score > highestScore) highestScore = r.score;
        if (r.score >= (quiz.passing_percentage || 40)) passedCount++;
        
        let bracket = Math.floor(r.score / 10);
        if (bracket >= 10) bracket = 9; // 100% goes into 90-100 bracket
        distribution[bracket].count++;
      });
      averageScore = Math.round(total / results.length);
    }

    res.json({
      quizTitle: quiz.title,
      summary: {
        totalAttempts: results.length,
        averageScore,
        highestScore,
        passRate: results.length > 0 ? Math.round((passedCount / results.length) * 100) : 0
      },
      distribution,
      roster: results
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
