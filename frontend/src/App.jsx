import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Shurutei login page dekhabe */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard er placeholders (Porobortite real page bosae dobo) */}
        <Route path="/admin-dashboard" element={<div style={{ padding: '20px' }}><h1>Welcome to Admin Dashboard 👑</h1></div>} />
        <Route path="/dashboard" element={<div style={{ padding: '20px' }}><h1>Welcome to Member Dashboard 📖</h1></div>} />
      </Routes>
    </Router>
  );
}

export default App;