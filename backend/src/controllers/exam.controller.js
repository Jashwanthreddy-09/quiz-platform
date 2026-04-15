const db = require('../config/db');

// Helper to check if an attempt has expired
const checkExpiration = async (attemptId) => {
  const attempt = await db.execute({
    sql: `SELECT a.*, q.duration 
          FROM attempts a 
          JOIN quizzes q ON a.quiz_id = q.id 
          WHERE a.id = ?`,
    args: [attemptId]
  });

  if (!attempt.rows.length) return { expired: true, error: "Attempt not found" };
  const { start_time, duration, status } = attempt.rows[0];

  if (status !== 'active') return { expired: true, status };

  const startTime = new Date(start_time);
  const endTime = new Date(startTime.getTime() + duration * 60000);
  const now = new Date();

  // Allow 10s grace period for submission
  if (now > new Date(endTime.getTime() + 10000)) {
    return { expired: true, remaining: 0 };
  }

  return { 
    expired: false, 
    remaining: Math.max(0, Math.floor((endTime - now) / 1000)) 
  };
};

exports.startAttempt = async (req, res) => {
  try {
    const { quizId } = req.body;
    const userId = req.user.id;

    const existing = await db.execute({
      sql: "SELECT * FROM attempts WHERE user_id = ? AND quiz_id = ? ORDER BY id DESC LIMIT 1",
      args: [userId, quizId]
    });

    if (existing.rows.length > 0) {
      if (existing.rows[0].status === 'submitted') {
        return res.status(403).json({ error: "You have already completed this exam and cannot retake it." });
      }
      return res.json({ attemptId: existing.rows[0].id, startTime: existing.rows[0].start_time });
    }

    const result = await db.execute({
      sql: "INSERT INTO attempts (user_id, quiz_id) VALUES (?, ?)",
      args: [userId, quizId]
    });

    res.status(201).json({ attemptId: result.lastInsertRowid, startTime: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRemainingTime = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const status = await checkExpiration(attemptId);
    
    if (status.expired && !status.error) {
       // If expired but still active, auto-submit logic could be triggered here or on next save
       return res.json({ remaining: 0, status: 'expired' });
    }
    
    res.json({ remaining: status.remaining });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.saveProgress = async (req, res) => {
  try {
    const { attemptId, questionId, answer } = req.body;
    
    const status = await checkExpiration(attemptId);
    if (status.expired) {
      return res.status(403).json({ error: "Time expired. Attempt has been closed.", expired: true });
    }

    await db.execute({
      sql: "INSERT OR REPLACE INTO attempt_answers (attempt_id, question_id, answer) VALUES (?, ?, ?)",
      args: [attemptId, questionId, answer]
    });

    res.json({ message: "Progress saved", remaining: status.remaining });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttemptProgress = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const answers = await db.execute({
      sql: "SELECT * FROM attempt_answers WHERE attempt_id = ?",
      args: [attemptId]
    });
    res.json(answers.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.submitExam = async (req, res) => {
  try {
    const { attemptId } = req.body;
    const userId = req.user.id;

    const attempt = await db.execute({
      sql: "SELECT * FROM attempts WHERE id = ?",
      args: [attemptId]
    });

    if (!attempt.rows.length) return res.status(404).json({ error: "Attempt not found" });
    const { quiz_id, status } = attempt.rows[0];

    if (status === 'submitted') return res.status(400).json({ error: "Exam already submitted" });

    // Validate time one last time
    const timeStatus = await checkExpiration(attemptId);
    // We allow submission if it's expired (auto-submit path), but we record it correctly

    const questionsRes = await db.execute({
      sql: "SELECT id, correct_answer, marks FROM questions WHERE quiz_id = ?",
      args: [quiz_id]
    });
    
    const answersRes = await db.execute({
      sql: "SELECT question_id, answer FROM attempt_answers WHERE attempt_id = ?",
      args: [attemptId]
    });

    const studentAnswers = {};
    answersRes.rows.forEach(a => studentAnswers[a.question_id] = a.answer);

    let score = 0;
    let totalMarks = 0;

    questionsRes.rows.forEach(q => {
      totalMarks += q.marks;
      if (studentAnswers[q.id] === q.correct_answer) {
        score += q.marks;
      }
    });

    const finalPercentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

    // Calculate time taken (seconds)
    const startTime = new Date(attempt.rows[0].start_time);
    const timeTaken = Math.floor((new Date() - startTime) / 1000);

    // Save Result
    const resResult = await db.execute({
      sql: "INSERT INTO results (user_id, quiz_id, score, total_questions, time_taken) VALUES (?, ?, ?, ?, ?)",
      args: [userId, quiz_id, Math.round(finalPercentage), questionsRes.rows.length, timeTaken]
    });

    const resultId = resResult.lastInsertRowid;

    // Close Attempt
    await db.execute({
      sql: "UPDATE attempts SET status = 'submitted', end_time = CURRENT_TIMESTAMP WHERE id = ?",
      args: [attemptId]
    });

    res.json({ message: "Exam submitted successfully", score: finalPercentage, resultId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
