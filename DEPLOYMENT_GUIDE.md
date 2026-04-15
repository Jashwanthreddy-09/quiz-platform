# 🚀 Production Deployment Guide

This guide will walk you through deploying the Online Quiz and Exam Platform to production, featuring a Vercel-hosted React frontend and a Render-hosted Node.js backend, backed by Turso (SQLite on the Edge).

---

## 1. Database Deployment (Turso)

Turso is natively integrated into the app via `@libsql/client`. 
1. Install the Turso CLI: `curl -sSf https://get.turso.tech/install.sh | bash`
2. Authenticate: `turso auth login`
3. Create a production database: `turso db create quiz-platform-db`
4. Get your Turso Database URL: `turso db show quiz-platform-db --url`
5. Generate an authentication token: `turso db tokens create quiz-platform-db`
6. *Save both the URL and Token. You will need them in the Backend deployment.*
7. **Migrate the schema:** Locally, temporarily update your `.env` to point to the production database and run `node src/models/initDb.js` to build the tables in the cloud. Remember to revert your `.env` back to local.

---

## 2. Backend Deployment (Render)

We have already configured `render.yaml` which enables "Infrastructure as Code". Render will securely run our `child_process` sandbox to execute student code.

1. Create a [Render.com](https://render.com/) account and connect your GitHub repository.
2. In the Render Dashboard, go to **Blueprints** -> **New Blueprint Instance**.
3. Select this repository. Render will automatically detect the `backend/render.yaml` file.
4. Render will prompt you for the Environment Variables. Input the following values from your `backend/.env.example`:
   - `JWT_SECRET`: Generate a secure random string.
   - `SESSION_SECRET`: Generate a secure random string.
   - `TURSO_DB_URL`: The URL from step 1.4.
   - `TURSO_DB_TOKEN`: The Token from step 1.5.
   - `FRONTEND_URL`: Temporary (Set to `*` or leave blank, we will update this after deploying the frontend).
5. Deploy. Wait for the deploy to finish and copy your live backend URL (e.g., `https://quiz-platform-backend-xyz1.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

We have already configured `vercel.json` and optimized the vite build commands.

1. Go to [Vercel.com](https://vercel.com/) and connect your GitHub repository.
2. Click **Add New Project** and select this repository.
3. In the "Framework Preset", ensure **Vite** is selected.
4. Set the **Root Directory** to `frontend`.
5. Expand "Environment Variables" and add:
   - `VITE_API_URL`: Your live backend URL from step 2.5 (e.g., `https://quiz-platform-backend-xyz1.onrender.com/api`).
6. Click **Deploy**.
7. Once deployed, copy your Live Frontend URL.

---

## 4. Final Polish & CORS Configuration

Now that everything is live, we must link the platforms securely.

1. **Update Render (Backend) CORS:** Go back to your Render Dashboard -> backend service -> Environment. Update the `FRONTEND_URL` variable to perfectly match your live Vercel URL (e.g., `https://your-app.vercel.app`). Restart the backend.
2. **Setup Admin:** Since the DB is fresh, manually insert your first Admin user directly into your Turso database via the Turso CLI:
   `turso db shell quiz-platform-db "INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@example.com', 'your_bcrypt_hashed_password', 'admin');"`

You're done! The application is fully live on the Edge.
