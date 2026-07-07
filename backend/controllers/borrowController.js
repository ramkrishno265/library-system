// controllers/borrowController.js
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');

// ➕ ১. বই ধার নেওয়ার ফাংশন (Borrow Book)
exports.borrowBook = async (req, res) => {
  // ফ্রন্টএন্ড থেকে মেম্বারের ইমেইল আর বইয়ের আইডি আসবে
  const { memberEmail, bookId } = req.body;

  try {
    // ধাপ ১: বইটা ডাটাবেজে আছে কি না এবং স্টক আছে কি না চেক করো
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found!' });
    }

    if (book.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Sorry, this book is currently out of stock! 📚❌' });
    }

    // ধাপ ২: ফেরত দেওয়ার তারিখ হিসাব করো (আজকের তারিখ থেকে ঠিক ৭ দিন পর)
    const today = new Date();
    const calculatedDueDate = new Date();
    calculatedDueDate.setDate(today.getDate() + 7); // এখানে ৭ এর জায়গায় যত দিন খুশি দিতে পারো

    // ধাপ ৩: ট্র্যাকিং খাতায় (Borrow Collection) নতুন এন্ট্রি করো
    const newBorrowRecord = new Borrow({
      memberEmail,
      bookId,
      dueDate: calculatedDueDate
    });
    await newBorrowRecord.save();

    // ধাপ ৪: মূল বইয়ের স্টক থেকে ১ পিস কমিয়ে দাও
    book.stock -= 1;
    await book.save();

    // সব সফল হলে ফ্রন্টএন্ডে সাকসেস মেসেজ পাঠাও
    res.status(201).json({ 
      success: true, 
      message: 'Book borrowed successfully! 🎉 Enjoy your reading.', 
      data: newBorrowRecord 
    });

  } catch (error) {
    console.error("Error in borrowBook:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};