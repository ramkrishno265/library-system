import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  
  // ডেমো ডাটা (পরবর্তীতে আমরা এগুলো এপিআই থেকে আনবো)
  const [stats] = useState({
    borrowedBooks: 3,
    returnedBooks: 12,
    fineDue: "৳০.০০",
  });

  const [borrowedList] = useState([
    { id: 1, title: "Ananda Math", author: "Bankim Chandra", borrowDate: "2026-06-15", dueDate: "2026-07-15", status: "Active" },
    { id: 2, title: "Gitanjali", author: "Rabindranath Tagore", borrowDate: "2026-06-20", dueDate: "2026-07-20", status: "Active" },
    { id: 3, title: "Pather Panchali", author: "Bibhutibhushan", borrowDate: "2026-05-01", dueDate: "2026-06-01", status: "Overdue" },
  ]);

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      
      {/* 📋 ১. সাইডবার (Sidebar) */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col justify-between p-5 hidden md:flex">
        <div>
          {/* লোগো/টাইটেল */}
          <div className="mb-10 p-2">
            <h1 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
              📚 LocalLink <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">LMS</span>
            </h1>
          </div>
          
          {/* নেভিগেশন লিংকস */}
          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium transition">
              <span>🏠</span> Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-medium transition">
              <span>📖</span> Browse Books
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-medium transition">
              <span>⏳</span> History
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-medium transition">
              <span>👤</span> My Profile
            </a>
          </nav>
        </div>

        {/* লগআউট বাটন */}
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-3 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white font-semibold rounded-xl transition duration-200"
        >
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* 💻 ২. মেইন কন্টেন্ট এরিয়া (Main Content Area) */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* 🔝 টপ বার (Top Bar) */}
        <header className="flex justify-between items-center mb-8 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name || 'Member'}! 👋</h2>
            <p className="text-sm text-slate-500 mt-0.5">Here is what's happening with your library account today.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role || 'Member'}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 text-blue-600 font-bold flex items-center justify-center rounded-xl border border-blue-200">
              {user?.name ? user.name[0].toUpperCase() : 'M'}
            </div>
          </div>
        </header>

        {/* 📊 ৩. স্ট্যাটস কার্ডস (Stats Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          
          {/* কার্ড ১ */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Currently Borrowed</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.borrowedBooks}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 text-xl flex items-center justify-center rounded-xl">📘</div>
          </div>

          {/* কার্ড ২ */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Books Returned</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.returnedBooks}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 text-xl flex items-center justify-center rounded-xl">✅</div>
          </div>

          {/* কার্ড ৩ */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Fine Due</p>
              <h3 className="text-3xl font-bold text-rose-600 mt-1">{stats.fineDue}</h3>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 text-xl flex items-center justify-center rounded-xl">💰</div>
          </div>

        </section>

        {/* 📅 ৪. ধার নেওয়া বইয়ের টেবিল (Borrowed Books Table) */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h4 className="text-lg font-bold text-slate-800">Your Borrowed Books</h4>
            <span className="text-xs px-2.5 py-1 bg-slate-200 text-slate-600 font-semibold rounded-full">Live Status</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Borrow Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {borrowedList.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-semibold text-slate-800">{book.title}</td>
                    <td className="px-6 py-4">{book.author}</td>
                    <td className="px-6 py-4">{book.borrowDate}</td>
                    <td className="px-6 py-4">{book.dueDate}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        book.status === 'Active' 
                          ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {book.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Dashboard;