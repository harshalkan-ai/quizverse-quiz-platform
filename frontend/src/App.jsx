import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCategories from './pages/admin/ManageCategories';
import ManageQuizzes from './pages/admin/ManageQuizzes';
import ManageQuestions from './pages/admin/ManageQuestions';
import Analytics from './pages/admin/Analytics';
import AIQuestionGenerator from './pages/admin/AIQuestionGenerator';
import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './pages/student/StudentDashboard';
import TakeQuiz from './pages/student/TakeQuiz';
import QuizResult from './pages/student/QuizResult';
import Leaderboard from './pages/student/Leaderboard';

function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Admin Routes (Requires ADMIN role) */}
      <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/categories" element={<ManageCategories />} />
        <Route path="/admin/quizzes" element={<ManageQuizzes />} />
        <Route path="/admin/questions" element={<ManageQuestions />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/ai-generator" element={<AIQuestionGenerator />} />
      </Route>

      {/* Protected Student Routes (Requires STUDENT role) */}
      <Route element={<ProtectedRoute allowedRole="STUDENT" />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/quiz/:quizId" element={<TakeQuiz />} />
        <Route path="/student/result/:attemptId" element={<QuizResult />} />
        <Route path="/student/leaderboard" element={<Leaderboard />} />
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;