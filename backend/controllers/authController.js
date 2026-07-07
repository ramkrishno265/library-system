const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role
        });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 🎯 সমাধান: টোকেনের সাথে ইউজারের অবজেক্টটিও ব্যাকএন্ড থেকে রিটার্ন করলাম
        res.status(200).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role // এই রোলটি দেখেই ফ্রন্টএন্ড ড্যাশবোর্ড ডিসাইড করবে
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in user' });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user profile' });
    }
}

const getAllMembers = async (req, res) => {
    try {
        const members = await User.find({ role: 'member' }).select('-password');
        res.status(200).json({
            success: true,
            count: members.length,
            data: members
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching members' });
    }
}

module.exports = { registerUser, loginUser, getUserProfile, getAllMembers };