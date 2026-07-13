// controllers/borrowController.js
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');

// ➕ ১. বই ধার নেওয়ার ফাংশন (Admin Direct Borrow)
const borrowBook = async (req, res) => {
  const { memberEmail, bookId, name, number } = req.body;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found!' });
    }

    if (book.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Sorry, out of stock!' });
    }

    const today = new Date();
    const calculatedDueDate = new Date();
    calculatedDueDate.setDate(today.getDate() + 7);

    const newBorrowRecord = new Borrow({
      name,         
      number,       
      memberEmail,
      bookId,
      dueDate: calculatedDueDate,
      status: 'Active'
    });

    await newBorrowRecord.save();

    book.stock -= 1;
    await book.save();

    res.status(201).json({ success: true, data: newBorrowRecord });

  } catch (error) {
    console.error("Error in borrowBook:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

// ➕ ২. ইউজার থেকে ধারের রিকোয়েস্ট নেওয়ার ফাংশন (User Request to Borrow)
const requestToBorrow = async (req, res) => {
  const { bookId } = req.params;
  let { dueDate, name, number, memberEmail } = req.body;

  try {
    if (!name || name === "undefined") name = "Anonymous Student";
    if (!memberEmail || memberEmail === "undefined") memberEmail = "student@mail.com";
    if (!number) number = "01700000000";

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found!' });
    }

    if (book.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Sorry, this book is out of stock!' });
    }

    const alreadyRequested = await Borrow.findOne({
      memberEmail,
      bookId,
      status: "Pending"
    });

    if (alreadyRequested) {
      return res.status(400).json({ success: false, message: 'You have already requested this book!' });
    }

    const newRequest = new Borrow({
      name,
      number,
      memberEmail,
      bookId,
      dueDate: new Date(dueDate),
      status: "Pending"
    });

    await newRequest.save();

    return res.status(201).json({
      success: true,
      message: 'Borrow request submitted successfully!',
      data: newRequest
    });

  } catch (error) {
    console.error("Error in requestToBorrow:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ➕ ৩. সব ধারের লিস্ট দেখার ফাংশন (Get All Borrows - Admin Dashboard)
const getAllBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find().populate('bookId', 'title author isbn');
    res.status(200).json({ success: true, data: borrows });
  } catch (error) {
    console.error("Error in getAllBorrows:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

// 🚀 ➕ ৪. নির্দিষ্ট লগইন করা মেম্বারের ধারের লিস্ট ও কাউন্ট আনার ফাংশন (ওয়েবসাইট ফাস্ট রাখার জন্য)
const getMemberBorrows = async (req, res) => {
  try {
    const { email } = req.params;

    // ডাটাবেজ লেভেলে ফিল্টার + পপুলেট একসাথে করা হচ্ছে যেন ফ্রন্টএন্ডে এক্সট্রা লোড না পড়ে
    const userBorrows = await Borrow.find({ 
      memberEmail: email.toLowerCase() 
    }).populate('bookId', 'title author');

    // একটিভ কয়টি বই বর্তমানে ধার করা আছে তার সংখ্যা
    const activeCount = userBorrows.filter(item => item.status === 'Active').length;

    res.status(200).json({ 
      success: true, 
      count: activeCount, 
      data: userBorrows 
    });
  } catch (error) {
    console.error("Error in getMemberBorrows:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 Approve/Status Update কন্ট্রোলার
const updateBorrowStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedBorrow = await Borrow.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBorrow) {
      return res.status(404).json({ success: false, message: "Borrow request not found" });
    }

    if (status === 'Active') {
      await Book.findByIdAndUpdate(updatedBorrow.bookId, { $inc: { stock: -1 } });
    }

    res.status(200).json({ success: true, message: "Status updated successfully", data: updatedBorrow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔴 Delete কন্ট্রোলার
const deleteBorrowRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBorrow = await Borrow.findByIdAndDelete(id);

    if (!deletedBorrow) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({ success: true, message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// এক্সপোর্ট লিস্টে নতুন ফাংশনটি যুক্ত করা হলো
module.exports = {
  borrowBook,
  requestToBorrow,
  getAllBorrows,
  getMemberBorrows, // 👈 এটি যুক্ত করা হয়েছে
  updateBorrowStatus,
  deleteBorrowRequest
};