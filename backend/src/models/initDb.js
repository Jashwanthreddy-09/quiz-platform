const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

console.log("TEST:", process.env.TEST_VAR);
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
        FOREIGN KEY (attempt_id) REFERENCES attempts(id),
        FOREIGN KEY (question_id) REFERENCES questions(id)
      )
    `);

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

module.exports = initDb;
initDb();