import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios'; // 🎯 কাস্টম এপিআই ইনস্ট্যান্স

const API_URL = '/books';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');

  // 📈 ডেমো ও রিয়েল স্ট্যাটিস্টিকস ডাটা
  const [adminStats, setAdminStats] = useState({
    totalMembers: 0,
    totalBooks: 0,
    pendingRequests: 7,
    totalIssued: 0, 
  });

  // 📝 ফরম এবং এডিটিং স্টেট (বইয়ের জন্য)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 📋 ফরমের ইনপুট ফিল্ড স্টেট (বইয়ের জন্য)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Fiction',
    isbn: '',
    stock: 0
  });

  // 👥 মেম্বার ম্যানেজমেন্ট স্টেট
  const [membersList, setMembersList] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false); 
  const [memberSearchQuery, setMemberSearchQuery] = useState(''); 
  const [isAddingMember, setIsAddingMember] = useState(false); 
  const [newMemberForm, setNewMemberForm] = useState({ name: '', email: '', password: '', phone: '', role: 'member' });

  // 🔄 বই ধারের এবং লগের স্টেটসমূহ
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false); 
  const [borrowModalTab, setBorrowModalTab] = useState('issue'); // 'issue' অথবা 'logs' ট্যাব টগল করার জন্য
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState(null); 
  const [borrowMemberEmail, setBorrowMemberEmail] = useState(''); 
  const [borrowLoading, setBorrowLoading] = useState(false); 
  const [generalBorrowSearch, setGeneralBorrowSearch] = useState(''); 
  const [issuedBooksList, setIssuedBooksList] = useState([]); // ইস্যু করা বইয়ের ইতিহাস/লগ রাখার জন্য
  const [logsLoading, setLogsLoading] = useState(false);

  // 👥 মেম্বারদের লিস্ট নিয়ে আসার ফাংশন
  const fetchMembers = async () => {
    try {
      setMembersLoading(true);
      const response = await API.get('/auth/members');
      const membersData = response.data.success ? response.data.data : (response.data || []);
      setMembersList(membersData);
      
      // লাইভ মেম্বার কাউন্ট স্টেট আপডেট ফিক্স
      setAdminStats(prev => ({ ...prev, totalMembers: membersData.length }));
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setMembersLoading(false);
    }
  };

  // 📋 ইস্যু করা বইয়ের লগ/ইতিহাস ব্যাকএন্ড থেকে আনার ফাংশন
  const fetchIssuedLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await API.get('/borrows/logs'); // তোমার ব্যাকএন্ড রাউট অনুযায়ী চেঞ্জ করতে পারো
      if (response.data.success) {
        setIssuedBooksList(response.data.data);
        setAdminStats(prev => ({ ...prev, totalIssued: response.data.data.length }));
      }
    } catch (error) {
      console.error("Error fetching borrow logs:", error);
      // ব্যাকএন্ড এপিআই রেডি না থাকলে ডেমো ডাটা দেখার জন্য (টেস্টিং পারপাস)
      setIssuedBooksList([
        {
          _id: '1',
          bookId: { title: 'Gitanjali', author: 'Rabindranath Tagore' },
          memberId: { name: 'Arafat Sarkar', email: 'arafat@gmail.com', phone: '01712345678' },
          returnDate: '2026-07-15'
        },
        {
          _id: '2',
          bookId: { title: 'Pather Panchali', author: 'Bibhutibhushan' },
          memberId: { name: 'Meherun Sultana', email: 'meherun@gmail.com', phone: '01987654321' },
          returnDate: '2026-07-20'
        }
      ]);
    } finally {
      setLogsLoading(false);
    }
  };

  // ➕ নতুন মেম্বার ব্যাকএন্ডে সেভ করার ফাংশন
  const handleCreateMember = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/auth/register', newMemberForm);
      if (response.data) {
        alert("New member added successfully! 🎉");
        setIsAddingMember(false);
        setNewMemberForm({ name: '', email: '', password: '', phone: '', role: 'member' });
        fetchMembers(); // মেম্বার লিস্ট ও কাউন্ট রিফ্রেশ
      }
    } catch (error) {
      console.error("Error creating member:", error);
      alert(error.response?.data?.message || "Something went wrong!");
    }
  };

  // 🗑️ মেম্বার ডিলিট করার ফাংশন
  const handleDeleteMember = async (id) => {
    if (window.confirm("Are you sure you want to delete this member? ⚠️")) {
      try {
        const response = await API.delete(`/auth/members/${id}`);
        if (response.data.success || response.status === 200) {
          alert("Member deleted successfully!");
          fetchMembers();
        }
      } catch (error) {
        console.error("Error deleting member:", error);
        alert(error.response?.data?.message || "Failed to delete member");
      }
    }
  };

  // 📚 ডাটাবেজ থেকে আসা বইয়ের রিয়েল লিস্ট স্টেট
  const [booksList, setBooksList] = useState([]);

  // 🔄 ব্যাকএন্ড থেকে সব বই লোড করা
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await API.get(`${API_URL}/`);
      if (response.data.success) {
        setBooksList(response.data.data);
        setAdminStats(prev => ({ ...prev, totalBooks: response.data.data.length }));
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchMembers();
    fetchIssuedLogs();
  }, []);

  // 🔄 ইনপুট চেঞ্জ হ্যান্ডেলার
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'stock' ? parseInt(value) || 0 : value
    });
  };

  const handleAddClick = () => {
    setEditingBook(null);
    setErrorMessage('');
    setFormData({ title: '', author: '', category: 'Fiction', isbn: '', stock: 1 });
    setIsFormOpen(true);
  };

  const handleEditClick = (book) => {
    setEditingBook(book);
    setErrorMessage('');
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      stock: book.stock
    });
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingBook(null);
    setErrorMessage('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      if (editingBook) {
        const response = await API.put(`${API_URL}/${editingBook._id}`, formData);
        if (response.data.success) {
          setBooksList(booksList.map(b => b._id === editingBook._id ? response.data.data : b));
        }
      } else {
        const response = await API.post(API_URL, formData);
        if (response.data.success) {
          setBooksList([response.data.data, ...booksList]);
          setAdminStats(prev => ({ ...prev, totalBooks: prev.totalBooks + 1 }));
        }
      }
      setIsFormOpen(false);
      setEditingBook(null);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Something went wrong!');
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const response = await API.delete(`${API_URL}/${id}`);
        if (response.data.success) {
          setBooksList(booksList.filter(b => b._id !== id));
          setAdminStats(prev => ({ ...prev, totalBooks: prev.totalBooks - 1 }));
        }
      } catch (error) {
        console.error("Error deleting book:", error);
        alert('Failed to delete the book');
      }
    }
  };

  // 🎯 বই ধার নেওয়ার সাবমিট হ্যান্ডেলার ফাংশন
  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    const targetBook = selectedBookForBorrow;
    if (!targetBook) return alert("Please select a book first! ⚠️");
    if (!borrowMemberEmail) return alert("Please enter member email! ⚠️");

    try {
      setBorrowLoading(true);
      const response = await API.post('/borrows/borrow', {
        memberEmail: borrowMemberEmail,
        bookId: targetBook._id
      });

      if (response.data.success) {
        alert("Book issued successfully! 📚🎉");
        setIsBorrowModalOpen(false); 
        setBorrowMemberEmail(''); 
        setSelectedBookForBorrow(null);
        setGeneralBorrowSearch('');
        fetchBooks(); 
        fetchIssuedLogs(); // লগের লিস্ট আপডেট করা
      }
    } catch (error) {
      console.error("Error borrowing book:", error);
      alert(error.response?.data?.message || "Something went wrong!");
    } finally {
      setBorrowLoading(false);
    }
  };

  // 🔍 ইমেইল ড্রপডাউন সাজেশন ফিল্টারিং লজিক
  const filteredEmailSuggestions = borrowMemberEmail
    ? membersList.filter(m => m.email?.toLowerCase().includes(borrowMemberEmail.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans relative">

      {/* 📊 ১. এডমিন সাইডবার */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col justify-between p-5 hidden md:flex">
        <div>
          <div className="mb-10 p-2">
            <h1 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
              📚 LocalLink <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">Admin</span>
            </h1>
          </div>

          <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium transition">
              <span>📊</span> Dashboard Overview
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-medium transition">
              <span>📖</span> Manage Books
            </a>
            <a href="#" onClick={() => { setBorrowModalTab('logs'); setIsBorrowModalOpen(true); }} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-medium transition">
              <span>🔄</span> Issue Logs <span className="ml-auto bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full font-bold">{adminStats.totalIssued}</span>
            </a>
            <button onClick={() => setIsMemberModalOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-medium transition text-left">
              <span>👥</span> Manage Members
            </button>
          </nav>
        </div>

        <button onClick={logout} className="flex items-center justify-center gap-2 w-full py-3 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white font-semibold rounded-xl transition duration-200">
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* 💻 ২. মেইন কন্টেন্ট এরিয়া */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">

        <header className="flex justify-between items-center mb-8 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Admin Control Panel ⚙️</h2>
            <p className="text-sm text-slate-500 mt-0.5">Welcome, {user?.name || 'Admin'}. Manage library assets and member approvals.</p>
          </div>
        </header>

        {/* 📈 ৩. এডমিন স্ট্যাটস গ্রিড */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Members</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">
                {membersLoading ? (
                  <span className="text-sm text-slate-400 animate-pulse">Loading...</span>
                ) : (
                  adminStats.totalMembers
                )}
              </h3>
            </div>
            <button onClick={() => setIsMemberModalOpen(true)} className="w-12 h-12 bg-blue-50 hover:bg-blue-100 text-blue-600 text-2xl flex items-center justify-center rounded-xl cursor-pointer transition">👥</button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Books</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{adminStats.totalBooks}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 text-xl flex items-center justify-center rounded-xl">📚</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Requests</p>
              <h3 className="text-3xl font-bold text-amber-600 mt-1">{adminStats.pendingRequests}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 text-xl flex items-center justify-center rounded-xl">⏳</div>
          </div>

          {/* 🎯 Books Issued কার্ডে ক্লিক করলেই লগ দেখার মডাল অপশন ওপেন হবে */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Books Issued</p>
              <h3 className="text-3xl font-bold text-purple-600 mt-1">{adminStats.totalIssued}</h3>
            </div>
            <button 
              onClick={() => {
                setBorrowModalTab('logs'); // সরাসরি লগ ট্যাবে ওপেন হবে
                setIsBorrowModalOpen(true);
              }}
              className="w-12 h-12 bg-purple-50 hover:bg-purple-100 text-purple-600 text-xl flex items-center justify-center rounded-xl cursor-pointer transition"
              title="Click to View Issued Logs"
            >
              📖
            </button>
          </div>
        </section>

        {/* 📋 ৪. ইনভেন্টরি টেবিল সেকশন */}
        <div className="space-y-6">
          {isFormOpen && (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{editingBook ? '🔄 Edit Book' : '🆕 Add New Book'}</h3>
              <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Book Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Author</label>
                  <input type="text" name="author" value={formData.author} onChange={handleInputChange} required className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white">
                    <option value="Fiction">Fiction</option>
                    <option value="Classic">Classic</option>
                    <option value="Novel">Novel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ISBN</label>
                  <input type="text" name="isbn" value={formData.isbn} onChange={handleInputChange} required className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Qty</label>
                  <input type="number" name="stock" min="0" value={formData.stock} onChange={handleInputChange} required className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white" />
                </div>
                <div className="md:col-span-5 flex justify-end gap-2">
                  <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-600 rounded-xl">Cancel</button>
                  <button type="submit" className="px-5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl">Save</button>
                </div>
              </form>
            </div>
          )}

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="text-lg font-bold text-slate-800">Library Inventory</h4>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search book..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white w-full sm:w-64"
                />
                <button onClick={handleAddClick} className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl whitespace-nowrap">➕ Add Book</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-100">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                  {booksList.filter(b => b.title?.toLowerCase().includes(searchQuery.toLowerCase())).map((book) => (
                    <tr key={book._id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4 font-semibold text-slate-800">{book.title}</td>
                      <td className="px-6 py-4">{book.author}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${book.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{book.stock} Left</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => { setSelectedBookForBorrow(book); setBorrowModalTab('issue'); setIsBorrowModalOpen(true); }} disabled={book.stock <= 0} className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg disabled:opacity-30">🔄</button>
                          <button onClick={() => handleEditClick(book)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg">📝</button>
                          <button onClick={() => handleDeleteClick(book._id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* 👥 ৫. মেম্বার লিস্ট পপ-আপ (Modal) */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold text-slate-800">Registered Members</h4>
              </div>
              <button onClick={() => { setIsMemberModalOpen(false); setIsAddingMember(false); }} className="text-slate-500 hover:text-slate-700">❌ Close</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {isAddingMember ? (
                <form onSubmit={handleCreateMember} className="max-w-md mx-auto space-y-4">
                  <input required type="text" placeholder="Full Name" value={newMemberForm.name} onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-xl" />
                  <input required type="email" placeholder="Email Address" value={newMemberForm.email} onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })} className="w-full px-3 py-2 border rounded-xl" />
                  <input required type="tel" placeholder="Phone Number" value={newMemberForm.phone} onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })} className="w-full px-3 py-2 border rounded-xl" />
                  <input required type="password" placeholder="Password" value={newMemberForm.password} onChange={(e) => setNewMemberForm({ ...newMemberForm, password: e.target.value })} className="w-full px-3 py-2 border rounded-xl" />
                  <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-xl">Save</button>
                </form>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-xs font-semibold uppercase">
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Phone</th>
                      <th className="px-4 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersList.map(member => (
                      <tr key={member._id} className="border-b text-sm">
                        <td className="px-4 py-3 font-semibold">{member.name}</td>
                        <td className="px-4 py-3">{member.email}</td>
                        <td className="px-4 py-3">{member.phone || 'N/A'}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => handleDeleteMember(member._id)} className="text-rose-600 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🎯 ৬. সর্বজনীন বই ইস্যু এবং লগ ট্র্যাকিং মডাল (Dynamic UI) */}
      {isBorrowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* মডাল ট্যাব হেডার */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex gap-2">
                <button 
                  onClick={() => setBorrowModalTab('issue')}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition ${borrowModalTab === 'issue' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  🚀 Issue New Book
                </button>
                <button 
                  onClick={() => { setBorrowModalTab('logs'); fetchIssuedLogs(); }}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition ${borrowModalTab === 'logs' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                  📋 View Issued Logs
                </button>
              </div>
              <button 
                onClick={() => { setIsBorrowModalOpen(false); setSelectedBookForBorrow(null); setBorrowMemberEmail(''); }}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ❌ Close
              </button>
            </div>

            {/* মডাল বডি কন্টেন্ট */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* ট্যাব ১: বই ইস্যু করার ফর্ম */}
              {borrowModalTab === 'issue' && (
                <form onSubmit={handleBorrowSubmit} className="space-y-4">
                  {!selectedBookForBorrow ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Search & Select Book</label>
                      <input 
                        type="text" 
                        placeholder="Type book title..."
                        value={generalBorrowSearch}
                        onChange={(e) => setGeneralBorrowSearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                      />
                      {generalBorrowSearch && (
                        <div className="max-h-32 overflow-y-auto border rounded-xl bg-slate-50 mt-1 text-xs">
                          {booksList.filter(b => b.title?.toLowerCase().includes(generalBorrowSearch.toLowerCase()) && b.stock > 0).map(book => (
                            <div key={book._id} onClick={() => { setSelectedBookForBorrow(book); setGeneralBorrowSearch(''); }} className="p-2 hover:bg-purple-50 cursor-pointer flex justify-between">
                              <span>📖 {book.title}</span>
                              <span className="text-emerald-600 font-bold">{book.stock} Left</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 flex justify-between items-center text-xs">
                      <p><strong>Selected Book:</strong> {selectedBookForBorrow.title} ({selectedBookForBorrow.author})</p>
                      <button type="button" onClick={() => setSelectedBookForBorrow(null)} className="text-purple-600 font-bold underline">Change</button>
                    </div>
                  )}

                  {/* 👥 মেম্বার জিমেইল সার্চ ও ড্রপডাউন সাজেশন (Autosuggestion Logic) */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Member Email Address</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="Type email to search member..." 
                      value={borrowMemberEmail}
                      onChange={(e) => setBorrowMemberEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-purple-500 bg-white"
                    />

                    {/* লাইভ ড্রপডাউন সাজেশন বক্স */}
                    {filteredEmailSuggestions.length > 0 && (
                      <div className="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100 text-xs">
                        {filteredEmailSuggestions.map(member => (
                          <div 
                            key={member._id}
                            onClick={() => setBorrowMemberEmail(member.email)}
                            className="p-2.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                          >
                            <div>
                              <p className="font-semibold text-slate-800">{member.name}</p>
                              <p className="text-slate-500 text-[11px]">{member.email}</p>
                            </div>
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">Verified</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {borrowMemberEmail && filteredEmailSuggestions.length === 0 && (
                      <div className="absolute z-50 left-0 right-0 mt-1 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs flex justify-between items-center">
                        <span>⚠️ Member not found in database!</span>
                        <button type="button" onClick={() => { setIsBorrowModalOpen(false); setIsMemberModalOpen(true); setIsAddingMember(true); }} className="underline font-bold">Add Member</button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button type="submit" disabled={borrowLoading || !selectedBookForBorrow || filteredEmailSuggestions.length === 0} className="px-5 py-2 text-sm font-semibold bg-purple-600 text-white rounded-xl shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed w-full">
                      {borrowLoading ? "Issuing Assets... ⏳" : "Confirm Asset Issue 🚀"}
                    </button>
                  </div>
                </form>
              )}

              {/* 📋 ট্যাব ২: কে কে বই নিয়েছে তার কমপ্লিট লগ টেবিল */}
              {borrowModalTab === 'logs' && (
                <div className="overflow-x-auto">
                  {logsLoading ? (
                    <div className="text-center py-6 text-slate-500">Loading Borrow Logs... ⏳</div>
                  ) : issuedBooksList.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">No books have been issued yet! 📖</div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
                          <th className="px-3 py-3">Book Title</th>
                          <th className="px-3 py-3">Member Details</th>
                          <th className="px-3 py-3">Contact info</th>
                          <th className="px-3 py-3 text-center">Return Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {issuedBooksList.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-50/80 transition">
                            <td className="px-3 py-3 font-semibold text-purple-700">{log.bookId?.title || 'Unknown Book'}</td>
                            <td className="px-3 py-3">
                              <p className="font-bold text-slate-800">{log.memberId?.name || 'N/A'}</p>
                              <p className="text-slate-400 text-[10px]">{log.memberId?.email || 'N/A'}</p>
                            </td>
                            <td className="px-3 py-3 font-mono">{log.memberId?.phone || 'No Phone'}</td>
                            <td className="px-3 py-3 text-center font-bold text-amber-600 bg-amber-50/30">⏰ {log.returnDate || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;