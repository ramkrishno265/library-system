import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  // Borrowed Books count & list
  const [borrowedCount, setBorrowedCount] = useState(0);
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  // 🎯 প্যাজিনেশন স্টেটসমূহ
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // প্রতি পেজে ১০টি করে ডাটা দেখাবে

  const fetchBorrowedCount = async () => {
    if (!user || !user.email) return;

    try {
      const response = await API.get(`/borrows?email=${user.email}&status=Active`);

      let allBorrows = [];
      if (Array.isArray(response.data)) {
        allBorrows = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        allBorrows = response.data.data;
      }

      const myBorrowedBooks = allBorrows.filter(item => {
        const dbEmail = (item.memberEmail || item.email || "")?.toLowerCase();
        return dbEmail === user.email.toLowerCase() && item.status === 'Active';
      });

      setBorrowedCount(myBorrowedBooks.length);
      setBorrowedBooks(myBorrowedBooks);
      setCurrentPage(1); // নতুন ডাটা লোড হলে প্রথম পেজে রিসেট হবে
    } catch (error) {
      console.error("Error fetching borrowed count:", error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchBorrowedCount();
    }
  }, [user]);

  const [stats] = useState({
    borrowedBooks: 3,
    returnedBooks: 12,
    fineDue: "৳০.০০",
  });

  // Available Books State
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalBooks, setTotalBooks] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [categories, setCategories] = useState([]);

  // Borrow Popup State
  const [borrowPopupOpen, setBorrowPopupOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await API.get("/books");

      if (response.data) {
        const fetchedBooks = response.data.data || [];
        setBooks(fetchedBooks);
        setTotalBooks(response.data.count || 0);

        const uniqueCategories = [...new Set(fetchedBooks.map(book => book.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [isPopupOpen]);

  // 🎯 প্যাজিনেশন ক্যালকুলেশন (Borrowed Books টেবিলের জন্য)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBorrowedBooks = borrowedBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(borrowedBooks.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">

      {/* 📋 ১. সাইডবার */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col justify-between p-5 hidden md:flex">
        <div>
          <div className="mb-10 p-2">
            <h1 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
              📚 LocalLink <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">LMS</span>
            </h1>
          </div>

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

        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-3 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white font-semibold rounded-xl transition duration-200"
        >
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* 💻 ২. মেইন কন্টেন্ট এরিয়া */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
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

        {/* 📊 ৩. স্ট্যাটসカード */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Currently Borrowed</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{borrowedCount}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 text-xl flex items-center justify-center rounded-xl">📘</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Available Books</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalBooks}</h3>
            </div>
            <button
              onClick={() => setIsPopupOpen(true)}
              className="w-12 h-12 bg-emerald-50 text-emerald-600 text-xl flex items-center justify-center rounded-xl hover:bg-emerald-100 transition"
            >
              ✅
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Fine Due</p>
              <h3 className="text-3xl font-bold text-rose-600 mt-1">{stats.fineDue}</h3>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 text-xl flex items-center justify-center rounded-xl">💰</div>
          </div>
        </section>

        {/* 📅 ৪. টেবিল */}
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
                {/* 🎯 এখানে borrowedBooks এর বদলে currentBorrowedBooks ম্যাপ করা হয়েছে */}
                {currentBorrowedBooks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500">No borrowed books found.</td>
                  </tr>
                ) : (
                  currentBorrowedBooks.map((book) => (
                    <tr key={book._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {book.bookId ? book.bookId.title : "Unknown Title"}
                      </td>
                      <td className="px-6 py-4">{book.bookId ? book.bookId.author : "Unknown Author"}</td>
                      <td className="px-6 py-4">{new Date(book.borrowDate || book.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{new Date(book.dueDate).toLocaleDateString()}</td>
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 🎯 🎛️ প্যাজিনেশন কন্ট্রোল UI */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-white">
              <div className="text-xs text-slate-500">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">
                  {indexOfLastItem > borrowedBooks.length ? borrowedBooks.length : indexOfLastItem}
                </span>{" "}
                of <span className="font-medium">{borrowedBooks.length}</span> records
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                
                <span className="px-3 py-1.5 text-xs font-semibold bg-slate-50 rounded-lg text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* 📜 Book list Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-500 px-8 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">📚 Available Books</h2>
                <p className="text-blue-100 text-sm mt-1">Browse books and borrow them instantly.</p>
              </div>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-white/20 text-white text-2xl transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-slate-50 border-b flex flex-col md:flex-row items-center justify-between gap-4">
              <input
                type="text"
                placeholder="🔍 Search by title, author or ISBN..."
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
                className="w-full md:w-96 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-60 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 capitalize"
              >
                <option value="All Categories">All Categories</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-100 border-b">
                  <tr className="text-left text-sm uppercase text-slate-600">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">ISBN</th>
                    <th className="px-6 py-4 text-center">Stock</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-500 font-medium">Loading books...</td>
                    </tr>
                  ) : books.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-slate-500">No books available.</td>
                    </tr>
                  ) : (
                    books
                      .filter((book) => {
                        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.author.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesCategory = selectedCategory === 'All Categories' || book.category === selectedCategory;
                        return matchesSearch && matchesCategory;
                      })
                      .map((book) => (
                        <tr key={book._id || book.id} className="border-b hover:bg-blue-50/50 transition">
                          <td className="px-6 py-4 font-semibold text-slate-800">{book.title}</td>
                          <td className="px-6 py-4">{book.author}</td>
                          <td className="px-6 py-4">{book.category}</td>
                          <td className="px-6 py-4">{book.isbn}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${book.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {book.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              disabled={book.stock === 0}
                              onClick={() => {
                                setSelectedBook(book);
                                setBorrowPopupOpen(true);
                              }}
                              className={`px-5 py-2 rounded-lg text-white transition ${book.stock > 0 ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
                            >
                              Borrow
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold">{books.length}</span> books
              </p>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⏳ Confirm Borrow Popup */}
      {borrowPopupOpen && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                📖 Confirm Borrowing
              </h2>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100/60">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Selected Book</p>
                <h3 className="text-lg font-bold text-slate-800 mt-0.5">{selectedBook.title}</h3>
                <p className="text-sm text-slate-500">by {selectedBook.author}</p>
              </div>

              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Borrow Date (Today):</span>
                  <span className="font-semibold text-slate-700">
                    {new Date().toLocaleDateString('en-GB')}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium">Return Due Date:</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {(() => {
                      const today = new Date();
                      today.setDate(today.getDate() + 14);
                      return today.toLocaleDateString('en-GB');
                    })()}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6 bg-amber-50 border border-amber-200/60 p-3 rounded-xl">
                ⚠️ <strong>Note:</strong> Returning the book after the due date will incur a fine.
              </p>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setBorrowPopupOpen(false);
                    setSelectedBook(null);
                  }}
                  className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-medium transition"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    try {
                      const returnDate = new Date();
                      returnDate.setDate(returnDate.getDate() + 14);

                      await API.post(`/borrows/request/${selectedBook._id}`, {
                        dueDate: returnDate,
                        status: "Pending",
                        name: user?.name || "Test Student",
                        memberEmail: user?.email || "student@mail.com",
                        number: user?.phone || "01700000000"
                      });

                      alert(`Borrow request submitted successfully! Waiting for Admin approval. ⏳`);

                      setBorrowPopupOpen(false);
                      setSelectedBook(null);
                      fetchBooks();
                    } catch (error) {
                      console.error("Borrow failed", error);
                      alert(error.response?.data?.message || "Something went wrong! Please check backend routes.");
                    }
                  }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition"
                >
                  Confirm & Borrow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;