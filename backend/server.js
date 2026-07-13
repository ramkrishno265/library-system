require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');

// ২. রাউট ফাইল ইমপোর্ট
const authRoutes = require('./routes/authRoutes');

const app = express(); 

// ৪. ডাটাবেজ কানেক্ট করা
connectDB();

// ৫. গ্লোবাল মিডলওয়্যার
app.use(cors());
app.use(express.json()); 

// 🎯 ৬. রাউট লিংক করা (শুধু এই এক লাইনেই সব অথ রাউট হ্যান্ডেল হবে)
app.use('/api/auth', authRoutes); 
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);



// ৭. বেজ ইউআরএল টেস্ট করার জন্য
app.get('/', (req, res) => {
  res.send('Server is running smoothly! 🚀');
});

// ৮. সার্ভার পোর্ট লিসেন
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🎉`);
});