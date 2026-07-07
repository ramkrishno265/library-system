// routes/borrowRoutes.js
const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');

// 🎯 বই ধার নেওয়ার এপিআই রাউট (POST Request)
// ফ্রন্টএন্ড থেকে URL হবে: /api/borrows/borrow
router.post('/borrow', borrowController.borrowBook);

module.exports = router;