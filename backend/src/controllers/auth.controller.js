const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.execute({
      sql: "SELECT id, name, username, email, role, profile_pic FROM users WHERE id = ?",
      args: [userId]
    });

    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, username } = req.body;

    await db.execute({
      sql: "UPDATE users SET name = ?, username = ? WHERE id = ?",
      args: [name, username, userId]
    });

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadProfilePic = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = `/uploads/profiles/${req.file.filename}`;
    
    await db.execute({
      sql: "UPDATE users SET profile_pic = ? WHERE id = ?",
      args: [filePath, userId]
    });

    res.json({ message: "Profile picture updated", filePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ✅ ADD THIS VALIDATION
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user exists
    const checkUser = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email]
    });

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'student'; // Default to student

    await db.execute({
      sql: "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      args: [name, email, hashedPassword, userRole]
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [email]
    });

    const user = result.rows[0];
    if (!user || user.google_id || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.googleSuccess = (req, res) => {
  if (req.user) {
    const token = jwt.sign(
      { id: req.user.id, role: req.user.role, name: req.user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    // Redirect back to frontend with token (In production, use secure cookies or a redirect URL)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}`);
  } else {
    res.status(401).json({ error: "Google authentication failed" });
  }
};
