// models/Borrow.js
const mongoose = require('mongoose');

const BorrowSchema = new mongoose.Schema({
  // ১. কে নিল? (এখন সরাসরি মেম্বারের ইউনিক ইমেইল যাবে স্ট্রিং হিসেবে)
  memberEmail: {
    type: String, // 🎯 ObjectId এর জায়গায় সরাসরি String করা হলো
    required: true,
    trim: true,
    lowercase: true
  },

  // ২. কোন বই নিল? (বইয়ের মঙ্গোডিবি আইডি-ই থাকল, কারণ বই তো সাধারণত ইমেইল দিয়ে ট্র্যাক হয় না)
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book', 
    required: true
  },

  // ৩. কবে নিল?
  borrowDate: {
    type: Date,
    default: Date.now
  },

  // ৪. কবে ফেরত দেওয়ার কথা?
  dueDate: {
    type: Date,
    required: true
  },

  // ৫. কবে ফেরত দিল?
  returnDate: {
    type: Date,
    default: null
  },

  // ৬. বইটির বর্তমান অবস্থা
  status: {
    type: String,
    enum: ['Active', 'Returned', 'Overdue'],
    default: 'Active'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Borrow', BorrowSchema);