const db = require('../config/db');
const xlsx = require('xlsx');
const fs = require('fs');

exports.addQuestion = async (req, res) => {
  try {
    const { quiz_id, type, text, options, correct_answer, marks, explanation } = req.body;
    
    await db.execute({
      sql: `INSERT INTO questions (quiz_id, type, text, options, correct_answer, marks, explanation) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        quiz_id, 
        type, 
        text, 
        options ? JSON.stringify(options) : null, 
        correct_answer, 
        marks || 1, 
        explanation
      ]
    });

    res.status(201).json({ message: "Question added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadQuestions = async (req, res) => {
  try {
    const { quiz_id } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const questions = data.map(row => ({
      quiz_id: parseInt(quiz_id),
      type: row.Type?.toLowerCase(),
      text: row.Text,
      options: row.Options ? row.Options.split('|').map(o => o.trim()) : null,
      correct_answer: row.CorrectAnswer?.toString(),
      marks: parseInt(row.Marks) || 1,
      explanation: row.Explanation
    }));

    // Bulk insert (iterative for SQLite/LibSQL simplicity in starter)
    for (const q of questions) {
      await db.execute({
        sql: `INSERT INTO questions (quiz_id, type, text, options, correct_answer, marks, explanation) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [q.quiz_id, q.type, q.text, q.options ? JSON.stringify(q.options) : null, q.correct_answer, q.marks, q.explanation]
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ message: `${questions.length} questions uploaded successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuizQuestions = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const result = await db.execute({
      sql: "SELECT * FROM questions WHERE quiz_id = ?",
      args: [quiz_id]
    });
    
    // Parse JSON options back
    const questions = result.rows.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null
    }));

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
