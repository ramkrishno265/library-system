const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    isbn: {
      type: String,
      required: [true, 'ISBN number is required'],
      unique: true, // 🎯 এক ISBN-এর বই দুইবার এন্ট্রি হতে দেবে না
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'], // 📦 স্টক যাতে মাইনাস (-১) না হয়
      default: 0,
    },
  },
  {
    // এটি অটোমেটিক createdAt এবং updatedAt টাইমস্ট্যাম্প হ্যান্ডেল করবে
    timestamps: true,
  }
);


bookSchema.index({ title: 'text', author: 'text', isbn: 1 }); // বইয়ের নাম বা লেখক দিয়ে সার্চ করার জন্য টেক্সট ইনডেক্স

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;