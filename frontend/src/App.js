import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import EmployeeRoute from './components/EmployeeRoute';

// Pages
import Register from './pages/Register';
import Login from './pages/Login';
import EmployeeLogin from './pages/EmployeeLogin';
import Dashboard from './pages/Dashboard';
import NewTransaction from './pages/NewTransaction';
import TransactionHistory from './pages/TransactionHistory';
import EmployeeDashboard from './pages/EmployeeDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />

          {/* CUSTOMER PROTECTED ROUTES - Only for customers */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-transaction"
            element={
              <ProtectedRoute>
                <NewTransaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <TransactionHistory />
              </ProtectedRoute>
            }
          />

          {/* EMPLOYEE PROTECTED ROUTES - Only for employees */}
          <Route
            path="/employee/dashboard"
            element={
              <EmployeeRoute>
                <EmployeeDashboard />
              </EmployeeRoute>
            }
          />
          
          {/* Add these employee-specific routes */}
          <Route
            path="/employee/pending"
            element={
              <EmployeeRoute>
                <EmployeeDashboard initialTab="pending" />
              </EmployeeRoute>
            }
          />
          <Route
            path="/employee/completed"
            element={
              <EmployeeRoute>
                <EmployeeDashboard initialTab="completed" />
              </EmployeeRoute>
            }
          />
          <Route
            path="/employee/customers"
            element={
              <EmployeeRoute>
                <EmployeeDashboard initialTab="customers" />
              </EmployeeRoute>
            }
          />

          {/* Default & 404 */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;