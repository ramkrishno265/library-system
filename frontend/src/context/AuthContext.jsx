import { createContext, useState, useEffect } from 'react';
import API from '../api/axios'; // 🎯 আসল ভুল এখানেই ছিল! axios এর জায়গায় আমাদের বানানো API ইম্পোর্ট করতে হবে

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // অ্যাপ চালু হলে আগে চেক করবে ব্রাউজারে আগে থেকে ইউজার সেভ আছে কিনা
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
      // এখন API ডিক্লেয়ার করায় এই লাইনটি নিখুঁতভাবে কাজ করবে
      const res = await API.post('/auth/login', { email, password });
      
      // ব্যাকএন্ড থেকে আসা ডাটা স্টেট এবং ব্রাউজারে সেভ করা
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      console.log("Real backend response:", res.data);
      
      return res.data.user; // রোল চেক করার জন্য ইউজার ডাটা রিটার্ন করলাম
    } catch (error) {
      // ব্যাকএন্ডের আসল এরর মেসেজ পাস করার জন্য
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