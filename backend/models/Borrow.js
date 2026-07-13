// models/Borrow.js
const mongoose = require('mongoose');

const BorrowSchema = new mongoose.Schema({
  // ১. মেম্বারের তথ্য
  name: {
    type: String,
    required: true, // 💡 অ্যাডমিন বা টোকেন থেকে নাম অবশ্যই আসতে হবে
    trim: true
  },
  number: {
    type: String,
    default: null,
    trim: true
  },
  memberEmail: {
    type: String, 
    required: true,
    trim: true,
    lowercase: true
  },

  // ২. কোন বই নিল?
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book', 
    required: true
  },

  // ৩. তারিখসমূহ
  borrowDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    default: null
  },

  // ৪. বইটির বর্তমান অবস্থা
  status: {
    type: String,
    // 🎯 এখানে 'Pending' যুক্ত করা হলো, এবং ডিফল্ট স্ট্যাটাস 'Pending' করা হলো
    enum: ['Pending', 'Active', 'Returned', 'Overdue'],
    default: 'Pending'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Borrow', BorrowSchema);