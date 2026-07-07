const express = require('express');
const router = express.Router();
const { createBook, getAllBooks, updateBook, deleteBook } = require('../controllers/bookController');
const { protect, admin } = require('../middlewares/authMiddleware'); // যদি মিডলওয়্যার থাকে
// const { protect, admin } = require('../middleware/authMiddleware'); // যদি মিডলওয়্যার থাকে

// রাউট ডিফাইন করা
router.route('/')
  .get(getAllBooks)
  .post(protect, createBook); // অ্যাডমিন মিডলওয়্যার থাকলে মাঝখানে বসিয়ে দিও, যেমন: .post(protect, admin, createBook)

router.route('/:id')
  .put(protect,  updateBook)
  .delete(protect, deleteBook);

module.exports = router;