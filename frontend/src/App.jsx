import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Shurutei login page dekhabe */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard er placeholders (Porobortite real page bosae dobo) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['member', 'user']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;