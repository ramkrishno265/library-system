import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // অ্যাপ চালু হলে আগে চেক করবে ব্রাউজারে আগে থেকে টোকেন সেভ আছে কিনা
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // লগইন ফাংশন
  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      // ব্যাকএন্ড থেকে আসা ডাটা (token, user info) স্টেট এবং ব্রাউজারে সেভ করা
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      return res.data.user; // রোল চেক করার জন্য ইউজার ডাটা ব্যাক করলাম
    } catch (error) {
      throw error.response ? error.response.data.message : "Login failed!";
    }
  };

  // লগআউট ফাংশন
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};