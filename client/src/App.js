import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DocumentUpload from './pages/DocumentUpload';
import TranslationWorkspace from './pages/TranslationWorkspace';
import QualityControl from './pages/QualityControl';
import BatchProcessing from './pages/BatchProcessing';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import LoadingSpinner from './components/LoadingSpinner';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/upload" element={<DocumentUpload />} />
                    <Route path="/workspace/:id?" element={<TranslationWorkspace />} />
                    <Route path="/quality-control" element={<QualityControl />} />
                    <Route path="/batch" element={<BatchProcessing />} />
                    <Route 
                      path="/users" 
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <UserManagement />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
