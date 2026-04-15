import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './components/AdminLayout';
import CreateExam from './pages/CreateExam';
import ManageQuestions from './pages/ManageQuestions';
import StudentDashboard from './pages/StudentDashboard';
import StudentLayout from './components/StudentLayout';
import ExamAttempt from './pages/ExamAttempt';
import ResultDetail from './pages/ResultDetail';
import Leaderboard from './pages/Leaderboard';
import AdminAnalytics from './pages/AdminAnalytics';




function App() {
  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"; // Replace with real ID

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            {/* Student Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="student">
                  <StudentLayout>
                    <StudentDashboard />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/attempt/:quizId"
              element={
                <ProtectedRoute role="student">
                  <ExamAttempt />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:resultId"
              element={
                <ProtectedRoute role="student">
                  <StudentLayout>
                    <ResultDetail />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard/:quizId"
              element={
                <ProtectedRoute role="student">
                  <StudentLayout>
                    <Leaderboard />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />


            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exams/new"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout>
                    <CreateExam />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exams/:id/questions"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout>
                    <ManageQuestions />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exams/:id/analytics"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout>
                    <AdminAnalytics />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
