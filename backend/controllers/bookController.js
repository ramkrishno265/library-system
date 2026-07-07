const Book = require('../models/Book');

// @desc    Create a new book (বই এন্ট্রি করা)
// @route   POST /api/books
// @access  Private/Admin
const createBook = async (req, res) => {
  try {
    const { title, author, category, isbn, stock } = req.body;

    // ১. একই ISBN এর বই অলরেডি আছে কিনা চেক করা
    const bookExists = await Book.findOne({ isbn });
    if (bookExists) {
      return res.status(400).json({ message: 'A book with this ISBN already exists' });
    }

    // ২. নতুন বই তৈরি করা
    const newBook = await Book.create({
      title,
      author,
      category,
      isbn,
      stock: parseInt(stock) || 0
    });

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: newBook
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Get all books (সব বইয়ের লিস্ট দেখা)
// @route   GET /api/books
// @access  Public
const getAllBooks = async (req, res) => {
  try {
    // নতুন বইগুলো যাতে টেবিলে আগে দেখায়, তাই sort({ createdAt: -1 }) দেওয়া হয়েছে
    const books = await Book.find({}).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update book details (বইয়ের তথ্য এডিট/আপডেট করা)
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res) => {
  try {
    const { title, author, category, isbn, stock } = req.body;
    const bookId = req.params.id;

    // ১. বইটি ডেটাবেজে আছে কিনা চেক করা
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // ২. ISBN চেঞ্জ করলে, নতুন ISBN অন্য কোনো বইয়ের সাথে মিলে যাচ্ছে কিনা চেক করা
    if (isbn && isbn !== book.isbn) {
      const isbnCheck = await Book.findOne({ isbn });
      if (isbnCheck) {
        return res.status(400).json({ message: 'This ISBN is already assigned to another book' });
      }
    }

    // ৩. ডেটা আপডেট করা
    book.title = title || book.title;
    book.author = author || book.author;
    book.category = category || book.category;
    book.isbn = isbn || book.isbn;
    book.stock = stock !== undefined ? parseInt(stock) : book.stock;

    const updatedBook = await book.save();

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
};

// @desc    Delete a book (বই ডিলিট করা)
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Book removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  createBook,
  getAllBooks,
  updateBook,
  deleteBook
};