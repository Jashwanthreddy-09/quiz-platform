const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      const result = await db.execute({
        sql: "SELECT * FROM users WHERE google_id = ? OR email = ?",
        args: [profile.id, profile.emails[0].value]
      });

      let user = result.rows[0];

      if (!user) {
        // Create new user
        const insertResult = await db.execute({
          sql: "INSERT INTO users (name, email, google_id, role) VALUES (?, ?, ?, ?) RETURNING *",
          args: [profile.displayName, profile.emails[0].value, profile.id, 'student']
        });
        user = insertResult.rows[0];
      } else if (!user.google_id) {
        // Link google account to existing email
        await db.execute({
          sql: "UPDATE users SET google_id = ? WHERE id = ?",
          args: [profile.id, user.id]
        });
        user.google_id = profile.id;
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [id]
    });
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});
