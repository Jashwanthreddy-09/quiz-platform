const db = require('../config/db');

exports.getAllQuizzes = async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM quizzes ORDER BY created_at DESC");
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
      status 
    } = req.body;

    await db.execute({
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
    res.status(201).json({ message: "Quiz created successfully" });
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

    await db.execute({
      sql: `UPDATE quizzes SET 
            title = ?, description = ?, duration = ?, 
            passing_percentage = ?, start_time = ?, 
            end_time = ?, status = ? 
            WHERE id = ?`,
      args: [
        title, description, duration, 
        passing_percentage, start_time, 
        end_time, status, id
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
    
    // Only allow deletion of drafts
    const check = await db.execute({
      sql: "SELECT status FROM quizzes WHERE id = ?",
      args: [id]
    });

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (check.rows[0].status !== 'draft') {
      return res.status(400).json({ error: "Only draft exams can be deleted." });
    }

    await db.execute({
      sql: "DELETE FROM quizzes WHERE id = ?",
      args: [id]
    });
    
    res.json({ message: "Quiz deleted successfully" });
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
