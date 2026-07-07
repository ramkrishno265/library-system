import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // .env থেকে ইউআরএল নিচ্ছে
});

// 🎯 ইন্টারসেপ্টর: ব্যাকএন্ডের 'protect' মিডলওয়্যারের জন্য টোকেন পাস করা
API.interceptors.request.use(
  (config) => {
    // ১. যদি টোকেন সরাসরি 'token' নামে সেভ করা থাকে
    let token = localStorage.getItem('token'); 

    // ২. আর যদি পুরো ইউজার অবজেক্ট 'userInfo' নামে সেভ থাকে, তবে নিচের ৩টি লাইন কাজ করবে:
    if (!token) {
      const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
      token = userInfo?.token; // অবজেক্টের ভেতর থেকে টোকেন বের করা
    }
    
    // টোকেন পাওয়া গেলে সেটাকে Bearer ফরম্যাটে হেডার্সে বসিয়ে দেওয়া
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;