import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // এটা অটোমেটিক .env ফাইল থেকে ইউআরএল টা নিয়ে নেবে
});

// পরবর্তীতে আমরা যখন টোকেন পাঠানো বা ইন্টারসেপ্টরের কাজ করব, তা এই ফাইলেই করব

export default API;