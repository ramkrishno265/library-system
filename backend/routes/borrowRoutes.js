// routes/borrowRoutes.js
const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');

// 🎯 বই ধার নেওয়ার এপিআই রাউট (POST Request)
// ফ্রন্টএন্ড থেকে URL হবে: /api/borrows
router.post('/', borrowController.borrowBook);

// 🎯 বই ধার নেওয়ার জন্য রিকোয়েস্ট পাঠানোর এপিআই রাউট (POST Request)
// URL: /api/borrows/request/:bookId
router.post('/request/:bookId', borrowController.requestToBorrow);

router.get('/', borrowController.getAllBorrows);
// 🟢 Approve করার জন্য রাউট (ফ্রন্টএন্ডের `/borrows/status/:id` এর সাথে মিল রেখে)
router.put('/status/:id', borrowController.updateBorrowStatus); // অথবা আপনার কন্ট্রোলার ফাংশনের নাম

// 🔴 Delete করার জন্য রাউট (ফ্রন্টএন্ডের `/borrows/:id` এর সাথে মিল রেখে)
router.delete('/:id', borrowController.deleteBorrowRequest); // অথবা আপনার কন্ট্রোলার ফাংশনের নাম
router.get('/member/:email', borrowController.getMemberBorrows); // 👈 এটি যুক্ত করা হয়েছে

module.exports = router;