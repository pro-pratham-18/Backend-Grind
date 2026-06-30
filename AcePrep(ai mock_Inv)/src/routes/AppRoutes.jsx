import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Loader from '../components/Loader.jsx';

const Home = lazy(() => import('../pages/Home.jsx'));
const Login = lazy(() => import('../pages/Login.jsx'));
const Signup = lazy(() => import('../pages/Signup.jsx'));
const Dashboard = lazy(() => import('../pages/Dashboard.jsx'));
const InterviewSetup = lazy(() => import('../pages/InterviewSetup.jsx'));
const InterviewSession = lazy(() => import('../pages/InterviewSession.jsx'));
const Results = lazy(() => import('../pages/Results.jsx'));
const TestSetup = lazy(() => import('../pages/TestSetup.jsx'));
const TestSession = lazy(() => import('../pages/TestSession.jsx'));
const TestResults = lazy(() => import('../pages/TestResults.jsx'));
const History = lazy(() => import('../pages/History.jsx'));
const Profile = lazy(() => import('../pages/Profile.jsx'));

const ProtectedLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {children}
    </main>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader size="lg" text="Loading..." />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/setup"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <InterviewSetup />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/session"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <InterviewSession />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/results"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Results />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/test/setup"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <TestSetup />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/test/session"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <TestSession />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/test/results"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <TestResults />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <History />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Profile />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
