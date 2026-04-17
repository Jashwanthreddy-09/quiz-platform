const db = require('../config/db');
const xlsx = require('xlsx');
const fs = require('fs');

exports.addQuestion = async (req, res) => {
  try {
    const { quiz_id, exam_id, type, text, options, correct_answer, marks, explanation } = req.body;
    const final_id = exam_id || quiz_id;
    console.log(`[QuestionController] Adding question to ID: ${final_id}, Type: ${type}`);
    
    // Validate based on type
    if (!type || !['mcq', 'short_answer', 'coding'].includes(type)) {
      return res.status(400).json({ error: "Invalid or missing question type" });
    }
    if (type === 'mcq') {
      if (!options || !Array.isArray(options) || options.length === 0 || !correct_answer) {
        return res.status(400).json({ error: "MCQ must have options and a correct_answer" });
      }
    } else if (type === 'short_answer') {
      if (!correct_answer || !text) {
        return res.status(400).json({ error: "Short answer must have text and a text answer" });
      }
    } else if (type === 'coding') {
      if (!text) {
        return res.status(400).json({ error: "Coding must have a description (text)" });
      }
    }

    await db.execute({
      sql: `INSERT INTO questions (quiz_id, type, text, options, correct_answer, marks, explanation) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        final_id, 
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
    const { quiz_id, exam_id } = req.body;
    const final_id = exam_id || quiz_id;
    console.log(`[QuestionController] Bulk uploading to ID: ${final_id}`);
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const results = {
      total: data.length,
      success: 0,
      failed: 0,
      errors: []
    };

    const validTypes = ['mcq', 'short_answer', 'coding'];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // Assuming header is row 1
      const type = row.Type?.toLowerCase().trim();
      const text = row.Text?.trim();
      const optionsStr = row.Options?.trim();
      const correctAnswer = row.CorrectAnswer?.toString().trim();
      const marks = parseInt(row.Marks) || 1;
      const explanation = row.Explanation?.trim();

      // Basic Validation
      if (!text) {
        results.failed++;
        results.errors.push({ row: rowNum, error: "Question text is missing" });
        continue;
      }
      if (!validTypes.includes(type)) {
        results.failed++;
        results.errors.push({ row: rowNum, error: `Invalid type '${type}'. Use mcq, short_answer, or coding.` });
        continue;
      }

      // Type-specific Validation
      if (type === 'mcq') {
        if (!optionsStr || !correctAnswer) {
          results.failed++;
          results.errors.push({ row: rowNum, error: "MCQ requires Options (pipe-separated) and CorrectAnswer" });
          continue;
        }
      } else if (type === 'short_answer' && !correctAnswer) {
        results.failed++;
        results.errors.push({ row: rowNum, error: "Short Answer requires a CorrectAnswer" });
        continue;
      }

      try {
        const optionsArr = optionsStr ? optionsStr.split('|').map(o => o.trim()) : null;
        
        await db.execute({
          sql: `INSERT INTO questions (quiz_id, type, text, options, correct_answer, marks, explanation) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [
            final_id, 
            type, 
            text, 
            optionsArr ? JSON.stringify(optionsArr) : null, 
            correctAnswer, 
            marks, 
            explanation
          ]
        });
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ row: rowNum, error: "Database insertion failed: " + err.message });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ 
      message: results.failed === 0 ? "All questions uploaded successfully" : "Bulk upload completed with some errors",
      summary: results 
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message });
  }
};

exports.downloadTemplate = async (req, res) => {
  try {
    const templateData = [
      {
        Text: "What is the capital of France?",
        Type: "mcq",
        Options: "London|Paris|Berlin|Madrid",
        CorrectAnswer: "Paris",
        Marks: 1,
        Explanation: "Paris is the capital and most populous city of France."
      },
      {
        Text: "Explain the process of photosynthesis.",
        Type: "short_answer",
        Options: null,
        CorrectAnswer: "Process used by plants to convert light into energy",
        Marks: 5,
        Explanation: null
      },
      {
        Text: "Write a function to add two numbers.",
        Type: "coding",
        Options: "javascript|{\"testCases\":[{\"input\":\"1,2\",\"output\":\"3\"}]}",
        CorrectAnswer: "function add(a, b) { return a + b; }",
        Marks: 10,
        Explanation: "Simple addition logic."
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(templateData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Questions");

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=quiz_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Lock removed per user request: Allow deleting questions even if published
    
    await db.execute({
      sql: "DELETE FROM questions WHERE id = ?",
      args: [id]
    });

    res.json({ message: "Question deleted successfully" });
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
      options: q.options ? JSON.parse(q.options) : (q.type === 'mcq' ? [] : null)
    }));

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
