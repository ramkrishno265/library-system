import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  // ১. AuthContext যতক্ষণ চেক করছে ইউজার লগইন কিনা, ততক্ষণ একটা লোডিং দেখাবো
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-600">Loading...</div>;
  }

  // ২. ইউজার যদি লগইন করা না থাকে, তবে তাকে সোজা লগইন পেজে পাঠিয়ে দাও
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ৩. ইউজার যদি লগইন থাকে কিন্তু তার রোল যদি এই পেজের জন্য অনুমোদিত না হয় (যেমন মেম্বার হয়ে এডমিন ড্যাশবোর্ডে ঢোকার চেষ্টা করলে)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'} replace />;
  }

  // সব ঠিক থাকলে আসল পেজটি দেখাও
  return children;
};

export default ProtectedRoute;