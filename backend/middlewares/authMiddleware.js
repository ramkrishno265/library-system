const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // ১. চেক করা হেডার-এ টোকেন আছে কিনা
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // হেডার থেকে আসল টোকেনটা আলাদা করা (Bearer token_string থেকে শুধু token_string নেওয়া)
      token = req.headers.authorization.split(' ')[1];

      // ২. টোকেনটি আসল কিনা তা ভেরিফাই করা
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ৩. ভেরিফাইড ইউজারের আইডি req অবজেক্টে ঢুকিয়ে দেওয়া যাতে পরের ফাংশন এটা পায়
      req.user = decoded; 

      // ৪. সব ঠিক আছে, এবার পরের ধাপে (Controller-এ) যাও
      next(); 
    } catch (error) {
      return res.status(401).json({ message: 'টোকেন সঠিক নয়, অ্যাক্সেস ডিনাইড!' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'কোনো টোকেন পাওয়া যায়নি, লগইন করুন!' });
  }
};

const adminOnly = (req, res, next) => {
  // req.user আসছে আগের protect মিডলওয়্যার থেকে
  if (req.user && req.user.role === 'admin') {
    next(); // ইউজার এডমিন হলে পরের ধাপে যাওয়ার অনুমতি দাও
  } else {
    return res.status(403).json({ message: 'অ্যাক্সেস ডিনাইড! এই কাজটি শুধু এডমিন করতে পারবে।' });
  }
};

module.exports = { protect, adminOnly };