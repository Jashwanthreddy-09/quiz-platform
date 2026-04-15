# Online Quiz and Exam Platform

A full-stack project structure for an Online Quiz and Exam Platform.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express
- **Database**: Turso (LibSQL)
- **Auth**: JWT + Bcrypt

## Getting Started

### Backend
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your details.
4. `npm run dev` (uses nodemon)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Folder Structure
- `backend/src/controllers`: Logic for API endpoints.
- `backend/src/routes`: API route definitions.
- `backend/src/config`: Connection settings for Turso.
- `frontend/src/pages`: UI pages (Home, Dashboard, etc.).
- `frontend/src/services`: API client (Axios).
- `frontend/src/components`: Reusable UI components.
