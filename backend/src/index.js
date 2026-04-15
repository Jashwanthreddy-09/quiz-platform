require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const db = require('./config/db');
const initDb = require('./models/initDb');

// Import routes
const authRoutes = require('./routes/auth.routes');
const quizRoutes = require('./routes/quiz.routes');
const adminRoutes = require('./routes/admin.routes');
const questionRoutes = require('./routes/question.routes');
const studentRoutes = require('./routes/student.routes');
const examRoutes = require('./routes/exam.routes');
const executionRoutes = require('./routes/execution.routes');
const resultRoutes = require('./routes/result.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');

// Configure Passport
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database
initDb();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Session needed for Passport (even if using JWT for API)
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/execute', executionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
