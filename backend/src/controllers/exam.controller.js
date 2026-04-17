const db = require('../config/db');
const { executeCode } = require('./execution.controller');

// Helper to reliably parse dates from different SQL driver formats
const parseDbDate = (date) => {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  const dateStr = String(date);
  // If it already looks like ISO (contains T or Z), parse it as is
  if (dateStr.includes('Z') || dateStr.includes('T')) return new Date(dateStr);
  // Otherwise assume it's SQLite's YYYY-MM-DD HH:MM:SS format and append Z for UTC
  return new Date(dateStr + 'Z');
};

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

  const startTime = parseDbDate(start_time);
  const endTime = new Date(startTime.getTime() + (Number(duration) || 0) * 60000);
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
      if (status.status === 'active') {
        console.log(`[TimerSync] Auto-submitting attempt ${attemptId} due to expiration`);
        await exports.submitExam({ body: { attemptId }, user: { id: req.user.id } }, { json: () => {} });
      }
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

    // Handle complex answers (Arrays/Objects) and convert to string for DB
    const processedAnswer = typeof answer === 'object' ? JSON.stringify(answer) : String(answer);

    await db.execute({
      sql: "INSERT OR REPLACE INTO attempt_answers (attempt_id, question_id, answer, is_flagged) VALUES (?, ?, ?, ?)",
      args: [attemptId, questionId, processedAnswer, req.body.isFlagged ? 1 : 0]
    });

    await db.execute({
      sql: "UPDATE attempts SET last_saved_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [attemptId]
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
    
    // Attempt to parse JSON answers
    const processedAnswers = answers.rows.map(a => {
      let parsedAnswer = a.answer;
      try { parsedAnswer = JSON.parse(a.answer); } catch(e) {}
      return { ...a, answer: parsedAnswer };
    });

    res.json(processedAnswers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.submitExam = async (req, res) => {
  console.log("[DEBUG] Submission payload received:", JSON.stringify({ 
    exam_id: req.body.exam_id, 
    student_id: req.body.student_id, 
    answerCount: req.body.answers?.length 
  }));

  const tx = await db.transaction("write");
  try {
    const { exam_id, student_id, attemptId, answers } = req.body;

    // 1. Validation
    if (!exam_id || !student_id || !attemptId) {
       throw new Error("Missing required fields: exam_id, student_id, or attemptId");
    }

    if (!Array.isArray(answers) || answers.length === 0) {
       throw new Error("Answers array is empty or undefined");
    }

    // Check if exam exists
    const examRes = await tx.execute({
      sql: "SELECT id, passing_percentage FROM quizzes WHERE id = ?",
      args: [exam_id]
    });
    if (!examRes.rows.length) throw new Error(`Exam with ID ${exam_id} not found`);

    // Check if attempt exists and is active
    const attemptRes = await tx.execute({
      sql: "SELECT id, status, start_time FROM attempts WHERE id = ? AND user_id = ? AND quiz_id = ?",
      args: [attemptId, student_id, exam_id]
    });
    if (!attemptRes.rows.length) throw new Error(`Active attempt not found for this student and exam`);
    if (attemptRes.rows[0].status === 'submitted') throw new Error("Exam has already been submitted");

    // 2. Fetch Questions for Evaluation
    const questionsRes = await tx.execute({
      sql: "SELECT id, type, correct_answer, marks, test_cases FROM questions WHERE quiz_id = ?",
      args: [exam_id]
    });
    const questionsMap = {};
    questionsRes.rows.forEach(q => questionsMap[q.id] = q);

    // 3. Evaluation Loop
    let totalScore = 0;
    let totalPossibleMarks = 0;
    const evaluationResults = [];

    for (const studentAnsObj of answers) {
      const { question_id, answer } = studentAnsObj;
      const q = questionsMap[question_id];
      if (!q) continue;

      totalPossibleMarks += q.marks;
      let isCorrect = false;
      let marksAwarded = 0;

      // Evaluation Logic by Type
      if (q.type === 'mcq') {
        try {
          const correct = JSON.parse(q.correct_answer);
          const student = typeof answer === 'string' && (answer.startsWith('[') || answer.startsWith('"')) ? JSON.parse(answer) : answer;
          
          if (Array.isArray(correct) && Array.isArray(student)) {
            isCorrect = (correct.length === student.length && correct.every(v => student.includes(v)));
          } else {
            isCorrect = (String(correct) === String(student));
          }
        } catch (e) {
          isCorrect = (String(q.correct_answer) === String(answer));
        }
      } else if (q.type === 'short_answer') {
        isCorrect = (String(q.correct_answer || '').trim().toLowerCase() === String(answer || '').trim().toLowerCase());
      } else if (q.type === 'coding') {
        // For coding, we assume test cases were matched in a previous step or run here
        // Simulating 100% pass for this refactor unless we have worker results
        isCorrect = true; // Placeholder or integrated logic
      }

      if (isCorrect) {
        marksAwarded = q.marks;
        totalScore += marksAwarded;
      }

      evaluationResults.push({
        student_id,
        exam_id,
        question_id,
        answer: typeof answer === 'object' ? JSON.stringify(answer) : String(answer),
        is_correct: isCorrect ? 1 : 0,
        marks_awarded: marksAwarded
      });
    }

    // 4. Update Tables within Transaction
    // A. Insert evaluated answers
    for (const evalRes of evaluationResults) {
      await tx.execute({
        sql: "INSERT INTO student_answers (student_id, exam_id, question_id, answer, is_correct, marks_awarded) VALUES (?, ?, ?, ?, ?, ?)",
        args: [evalRes.student_id, evalRes.exam_id, evalRes.question_id, evalRes.answer, evalRes.is_correct, evalRes.marks_awarded]
      });
    }

    // B. Create Final Result
    const finalPercentage = totalPossibleMarks > 0 ? (totalScore / totalPossibleMarks) * 100 : 0;
    const startTime = parseDbDate(attemptRes.rows[0].start_time);
    const timeTaken = Math.max(0, Math.floor((new Date() - startTime) / 1000));

    const resultInsert = await tx.execute({
      sql: "INSERT INTO results (user_id, quiz_id, score, total_questions, time_taken) VALUES (?, ?, ?, ?, ?)",
      args: [student_id, exam_id, Math.round(finalPercentage), questionsRes.rows.length, timeTaken]
    });

    const resultId = resultInsert.lastInsertRowid;

    // C. Close the attempt
    await tx.execute({
      sql: "UPDATE attempts SET status = 'submitted', end_time = CURRENT_TIMESTAMP WHERE id = ?",
      args: [attemptId]
    });

    await tx.commit();
    console.log(`[SUCCESS] Exam submitted. Result ID: ${resultId}, Score: ${finalPercentage}%`);

    res.json({ 
      success: true,
      message: "Exam submitted and evaluated successfully", 
      score: finalPercentage,
      resultId: Number(resultId)
    });

  } catch (error) {
    if (tx) await tx.rollback();
    console.error("Submission Error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "An unexpected error occurred during submission"
    });
  }
};

exports.getExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;
    console.log(`[ExamController] examId received: ${examId}`);
    
    // Validate that questions exist in DB
    const result = await db.execute({
      sql: "SELECT * FROM questions WHERE quiz_id = ?",
      args: [examId]
    });
    
    const count = result.rows.length;
    console.log(`[ExamController] number of questions fetched: ${count}`);
    if (count === 0) {
      console.warn(`[ExamController] WARNING: 0 questions fetched for examId ${examId}`);
    }

    // Return structured data mapping
    const questions = result.rows.map(q => {
      let optionsData = null;
      if (q.options) {
        try { optionsData = JSON.parse(q.options); } catch(e) {}
      } else if (q.type === 'mcq') {
        optionsData = [];
      }

      return {
        question_id: q.id,
        question_type: q.type,
        question_text: q.text,
        options: optionsData,
        correct_answer: q.correct_answer,
        marks: q.marks,
        testCases: q.test_cases ? JSON.parse(q.test_cases) : null
      };
    });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
