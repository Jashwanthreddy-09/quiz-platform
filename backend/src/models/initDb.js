require("dotenv").config();

console.log("ENV CHECK:", process.env.TURSO_DB_URL);
const db = require('../config/db');

async function initDb() {
  try {
    // Create Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        username TEXT UNIQUE,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        role TEXT DEFAULT 'student',
        google_id TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Quizzes table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        duration INTEGER, -- renamed from time_limit for clarity
        passing_percentage INTEGER DEFAULT 40,
        start_time DATETIME,
        end_time DATETIME,
        status TEXT DEFAULT 'draft', -- 'draft' or 'published'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Results/Attempts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        quiz_id INTEGER NOT NULL,
        score INTEGER,
        total_questions INTEGER,
        time_taken INTEGER, -- seconds
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
      )
    `);

    // Create Questions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER NOT NULL,
        type TEXT NOT NULL, -- 'mcq', 'short_answer', 'coding'
        text TEXT NOT NULL,
        options TEXT, -- JSON string for MCQ options
        correct_answer TEXT,
        marks INTEGER DEFAULT 1,
        explanation TEXT,
        test_cases TEXT, -- JSON string for coding test cases
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
      )
    `);

    // Create Attempts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        quiz_id INTEGER NOT NULL,
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        last_saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active', -- 'active', 'submitted'
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
      )
    `);

    // Create Attempt Answers table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS attempt_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        attempt_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        answer TEXT,
        is_flagged BOOLEAN DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (attempt_id) REFERENCES attempts(id),
        FOREIGN KEY (question_id) REFERENCES questions(id)
      )
    `);

    // Create Notifications table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        type TEXT, -- 'exam_published', 'result_declared'
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create Student Answers table (Final Evaluation Record)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS student_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        exam_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        answer TEXT,
        is_correct BOOLEAN DEFAULT 0,
        marks_awarded INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (exam_id) REFERENCES quizzes(id),
        FOREIGN KEY (question_id) REFERENCES questions(id)
      )
    `);

    console.log("Database initialized successfully.");

    // ADDED: Safe Schema Reconciliation (Migrations)
    // 1. attempts table
    const attemptsCols = await db.execute("PRAGMA table_info(attempts)");
    if (!attemptsCols.rows.find(c => c.name === 'last_saved_at')) {
      console.log("Adding last_saved_at to attempts table...");
      await db.execute("ALTER TABLE attempts ADD COLUMN last_saved_at DATETIME");
    }

    // 2. attempt_answers table reconciliation
    const answersCols = await db.execute("PRAGMA table_info(attempt_answers)");
    if (!answersCols.rows.find(c => c.name === 'is_flagged')) {
      console.log("Adding is_flagged to attempt_answers table...");
      await db.execute("ALTER TABLE attempt_answers ADD COLUMN is_flagged BOOLEAN DEFAULT 0");
    }
    if (!answersCols.rows.find(c => c.name === 'timestamp')) {
      console.log("Adding timestamp to attempt_answers table...");
      await db.execute("ALTER TABLE attempt_answers ADD COLUMN timestamp DATETIME");
    }

    // NEW: Deduplication & Unique Index for attempt_answers
    console.log("Deduplicating attempt_answers and enforcing uniqueness...");
    try {
      // Remove all but the latest entries for each question in an attempt
      await db.execute(`
        DELETE FROM attempt_answers 
        WHERE id NOT IN (
          SELECT MAX(id) 
          FROM attempt_answers 
          GROUP BY attempt_id, question_id
        )
      `);
      // Create unique constraint via index
      await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_attempt_question ON attempt_answers(attempt_id, question_id)");
    } catch (e) {
      console.warn("Attempt answers deduplication warning:", e.message);
    }

    // 3. results table reconciliation
    const resultsCols = await db.execute("PRAGMA table_info(results)");
    if (!resultsCols.rows.find(c => c.name === 'total_questions')) {
      console.log("Adding total_questions to results table...");
      await db.execute("ALTER TABLE results ADD COLUMN total_questions INTEGER");
    }
    if (!resultsCols.rows.find(c => c.name === 'time_taken')) {
      console.log("Adding time_taken to results table...");
      await db.execute("ALTER TABLE results ADD COLUMN time_taken INTEGER");
    }

    console.log("Schema reconciliation complete.");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

module.exports = initDb;