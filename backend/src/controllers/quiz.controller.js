const db = require('../config/db');

exports.getAllQuizzes = async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT q.*, (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count
      FROM quizzes q 
      ORDER BY q.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      duration, 
      passing_percentage, 
      start_time, 
      end_time, 
      status,
      questions 
    } = req.body;

    console.log("Creating quiz with body:", req.body);
    const quizResult = await db.execute({
      sql: `INSERT INTO quizzes 
            (title, description, duration, passing_percentage, start_time, end_time, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        title, 
        description, 
        duration, 
        passing_percentage || 40, 
        start_time, 
        end_time, 
        status || 'draft'
      ]
    });

    const quizId = quizResult.lastInsertRowid;
    console.log(`[QuizController] Base Quiz Created. ID: ${quizId} (Type: ${typeof quizId})`);

    if (questions && Array.isArray(questions) && questions.length > 0) {
      console.log(`[QuizController] Attempting to batch insert ${questions.length} questions for Quiz ID: ${quizId}`);
      
      const statements = questions.map((q, idx) => {
        // Safe mapping
        const q_quiz_id = Number(quizId);
        if (isNaN(q_quiz_id)) {
          throw new Error(`Invalid quizId detected during question mapping at index ${idx}`);
        }

        return {
          sql: `INSERT INTO questions 
                (quiz_id, type, text, options, correct_answer, marks, explanation, test_cases) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            q_quiz_id,
            q.type,
            q.text,
            q.options ? JSON.stringify(q.options) : null,
            q.correct_answer ? (typeof q.correct_answer === 'object' ? JSON.stringify(q.correct_answer) : String(q.correct_answer)) : null,
            q.marks || 1,
            q.explanation || '',
            q.test_cases ? JSON.stringify(q.test_cases) : null
          ]
        };
      });

      try {
        await db.batch(statements, "write");
        console.log(`[QuizController] Batch insertion successful for Quiz ID: ${quizId}`);
      } catch (batchError) {
        console.error(`[QuizController] CRITICAL: Batch insertion failed for Quiz ID ${quizId}:`, batchError);
        throw batchError; // Re-throw to be caught by outer catch and returned to client
      }
    } else {
      console.warn(`[QuizController] No questions provided in request body for Quiz ID: ${quizId}`);
    }

    res.status(201).json({ message: "Quiz and questions created successfully", quizId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      duration, 
      passing_percentage, 
      start_time, 
      end_time, 
      status 
    } = req.body;

    // Check if quiz is published
    const check = await db.execute({
      sql: "SELECT status FROM quizzes WHERE id = ?",
      args: [id]
    });

    if (check.rows.length > 0 && check.rows[0].status === 'published') {
      return res.status(403).json({ error: "Cannot edit an exam once it has been published." });
    }

    await db.execute({
      sql: `UPDATE quizzes SET 
            title = ?, description = ?, duration = ?, 
            passing_percentage = ?, start_time = ?, 
            end_time = ?, status = ? 
            WHERE id = ?`,
      args: [
        title, description, duration, 
        passing_percentage, start_time, 
        end_time, status || 'draft', id
      ]
    });
    res.json({ message: "Quiz updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if quiz exists and its status
    const check = await db.execute({
      sql: "SELECT status FROM quizzes WHERE id = ?",
      args: [id]
    });

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Deletion allowed for all statuses. Cascading cleanup follows.

    // Cascade delete related dependencies to prevent SQLite constraint failures
    await db.execute({ sql: "DELETE FROM attempt_answers WHERE attempt_id IN (SELECT id FROM attempts WHERE quiz_id = ?)", args: [id] });
    await db.execute({ sql: "DELETE FROM attempts WHERE quiz_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM results WHERE quiz_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM questions WHERE quiz_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM quizzes WHERE id = ?", args: [id] });
    
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.publishQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[publishQuiz] Requested for ID:`, id);
    
    // Check if quiz has questions
    const qCheck = await db.execute({
      sql: "SELECT COUNT(*) as count FROM questions WHERE quiz_id = ?",
      args: [id]
    });

    const questionCount = Number(qCheck.rows[0].count);
    console.log(`[publishQuiz] questionCount:`, questionCount, `(Original: ${qCheck.rows[0].count})`);

    if (questionCount === 0) {
      console.warn(`[publishQuiz] Cannot publish exam without questions for ID:`, id);
      return res.status(400).json({ error: "Cannot publish exam without questions" });
    }

    await db.execute({
      sql: "UPDATE quizzes SET status = 'published' WHERE id = ?",
      args: [id]
    });

    // Notify all students
    const quizTitleResult = await db.execute({ sql: "SELECT title FROM quizzes WHERE id = ?", args: [id] });
    const quizTitle = quizTitleResult.rows[0]?.title || "A new exam";

    const students = await db.execute("SELECT id FROM users WHERE role = 'student'");
    if (students.rows.length > 0) {
      const notificationStatements = students.rows.map(s => ({
        sql: "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
        args: [s.id, "New Exam Published", `Ready for assessment: ${quizTitle}`, "exam_published"]
      }));
      await db.batch(notificationStatements, "write");
    }

    res.json({ message: "Exam published and locked successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: "SELECT * FROM quizzes WHERE id = ?",
      args: [id]
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
