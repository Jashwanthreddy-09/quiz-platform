import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
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
import MyExams from './pages/MyExams';
import Results from './pages/Results';
import Profile from './pages/Profile';
import ManageExams from './pages/ManageExams';
import ManageUsers from './pages/ManageUsers';
import GlobalAnalytics from './pages/GlobalAnalytics';
import Settings from './pages/Settings';
import EditExam from './pages/EditExam';




function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"; // Replace with real ID

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
              path="/exams"
              element={
                <ProtectedRoute role="student">
                  <StudentLayout>
                    <MyExams />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute role="student">
                  <StudentLayout>
                    <Results />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute role="student">
                  <StudentLayout>
                    <Profile />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute role="student">
                  <StudentLayout>
                    <Settings />
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
              path="/admin/exams/:id/edit"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout>
                    <EditExam />
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
            <Route
              path="/admin/exams"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout>
                    <ManageExams />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/results/:resultId"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout>
                    <ResultDetail />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout>
                    <ManageUsers />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout>
                    <GlobalAnalytics />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout>
                    <Settings />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout>
                    <div className="glass-card p-20 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-500">
                      <ShieldAlert className="w-16 h-16 mb-4 opacity-20" />
                      <p className="font-bold text-xl text-white">Security Logs</p>
                      <p className="text-sm uppercase tracking-widest mt-2 font-mono">System Integrity Checked: 100%</p>
                    </div>
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
