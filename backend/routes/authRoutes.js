const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile,getAllMembers } = require('../controllers/authController');
const {protect , adminOnly} = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile',protect, getUserProfile);
router.get('/admin',protect, adminOnly, (req, res) => {
    res.json({ message: 'Welcome, Admin!' });
});
router.route('/members').get(protect, adminOnly, getAllMembers);

module.exports = router;