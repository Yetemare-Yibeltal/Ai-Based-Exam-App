import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import useAuthStore from './store/useAuthStore';
import useUIStore from './store/useUIStore';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/ui/ProtectedRoute';
import PublicRoute from './components/ui/PublicRoute';

// ── STUDENT PAGES ──────────────────────────────────────────
const StudentLogin = lazy(() => import('./pages/student/Login'));
const StudentRegister = lazy(() => import('./pages/student/Register'));
const StudentHome = lazy(() => import('./pages/student/Home'));
const StudentSubjects = lazy(() => import('./pages/student/Subjects'));
const StudentQuiz = lazy(() => import('./pages/student/Quiz'));
const StudentResults = lazy(() => import('./pages/student/Results'));
const StudentScores = lazy(() => import('./pages/student/Scores'));
const StudentLeaderboard = lazy(() => import('./pages/student/Leaderboard'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));
const StudentStudyTips = lazy(() => import('./pages/student/StudyTips'));
const StudentAIChat = lazy(() => import('./pages/student/AIChat'));
const VerifyEmail = lazy(() => import('./pages/student/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/student/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/student/ResetPassword'));

// ── TEACHER PAGES ──────────────────────────────────────────
const TeacherLogin = lazy(() => import('./pages/teacher/Login'));
const TeacherDashboard = lazy(() => import('./pages/teacher/Dashboard'));
const TeacherCreateQuestion = lazy(() => import('./pages/teacher/CreateQuestion'));
const TeacherManageQuestions = lazy(() => import('./pages/teacher/ManageQuestions'));
const TeacherAIGenerate = lazy(() => import('./pages/teacher/AIGenerate'));
const TeacherProfile = lazy(() => import('./pages/teacher/Profile'));
const TeacherAnalytics = lazy(() => import('./pages/teacher/Analytics'));

// ── ADMIN PAGES ────────────────────────────────────────────
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminStudents = lazy(() => import('./pages/admin/Students'));
const AdminTeachers = lazy(() => import('./pages/admin/Teachers'));
const AdminQuestions = lazy(() => import('./pages/admin/Questions'));
const AdminApproveQuestions = lazy(() => import('./pages/admin/ApproveQuestions'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));

// ── SHARED PAGES ───────────────────────────────────────────
const Landing = lazy(() => import('./pages/Landing'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  const { checkAuth, isAuthenticated, user } = useAuthStore();
  const { theme } = useUIStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>

            {/* ── PUBLIC ROUTES ─────────────────────────────── */}
            <Route path="/" element={<Landing />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ── STUDENT AUTH ───────────────────────────────── */}
            <Route path="/login" element={
              <PublicRoute>
                <StudentLogin />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <StudentRegister />
              </PublicRoute>
            } />

            {/* ── STUDENT PROTECTED ──────────────────────────── */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentHome />
              </ProtectedRoute>
            } />
            <Route path="/student/home" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentHome />
              </ProtectedRoute>
            } />
            <Route path="/student/subjects" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentSubjects />
              </ProtectedRoute>
            } />
            <Route path="/student/quiz/:subject" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentQuiz />
              </ProtectedRoute>
            } />
            <Route path="/student/results/:scoreId" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentResults />
              </ProtectedRoute>
            } />
            <Route path="/student/scores" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentScores />
              </ProtectedRoute>
            } />
            <Route path="/student/leaderboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLeaderboard />
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentProfile />
              </ProtectedRoute>
            } />
            <Route path="/student/study-tips" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentStudyTips />
              </ProtectedRoute>
            } />
            <Route path="/student/ai-chat" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAIChat />
              </ProtectedRoute>
            } />

            {/* ── TEACHER AUTH ───────────────────────────────── */}
            <Route path="/teacher/login" element={
              <PublicRoute>
                <TeacherLogin />
              </PublicRoute>
            } />

            {/* ── TEACHER PROTECTED ──────────────────────────── */}
            <Route path="/teacher" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/teacher/dashboard" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/teacher/create-question" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherCreateQuestion />
              </ProtectedRoute>
            } />
            <Route path="/teacher/manage-questions" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherManageQuestions />
              </ProtectedRoute>
            } />
            <Route path="/teacher/ai-generate" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherAIGenerate />
              </ProtectedRoute>
            } />
            <Route path="/teacher/profile" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherProfile />
              </ProtectedRoute>
            } />
            <Route path="/teacher/analytics" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherAnalytics />
              </ProtectedRoute>
            } />

            {/* ── ADMIN AUTH ─────────────────────────────────── */}
            <Route path="/admin/login" element={
              <PublicRoute>
                <AdminLogin />
              </PublicRoute>
            } />

            {/* ── ADMIN PROTECTED ────────────────────────────── */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStudents />
              </ProtectedRoute>
            } />
            <Route path="/admin/teachers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTeachers />
              </ProtectedRoute>
            } />
            <Route path="/admin/questions" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminQuestions />
              </ProtectedRoute>
            } />
            <Route path="/admin/approve-questions" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminApproveQuestions />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReports />
              </ProtectedRoute>
            } />
            <Route path="/admin/notifications" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminNotifications />
              </ProtectedRoute>
            } />

            {/* ── REDIRECTS ──────────────────────────────────── */}
            <Route path="/dashboard" element={
              isAuthenticated && user?.role === 'admin'
                ? <Navigate to="/admin/dashboard" replace />
                : isAuthenticated && user?.role === 'teacher'
                ? <Navigate to="/teacher/dashboard" replace />
                : isAuthenticated
                ? <Navigate to="/student/home" replace />
                : <Navigate to="/login" replace />
            } />

            {/* ── 404 ───────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
}