import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios'; // এক্সিওস ইনস্ট্যান্স ইમপোর্ট করলাম

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // এখন আর পুরো 'http://localhost:5000/api' লেখা লাগছে না, শুধু এন্ডপয়েন্ট দিলেই হচ্ছে
      const res = await API.post('/auth/register', formData);
      setSuccess(res.data.message || 'Registration successful! 🎉');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Something went wrong!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-sm text-slate-500 mt-2">Join our Library Management System</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-500 border border-red-200 text-sm p-3 rounded-xl mb-5 text-center">{error}</div>}
        {success && <div className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm p-3 rounded-xl mb-5 text-center">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Full Name</label>
            <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required 
                   className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Email Address</label>
            <input type="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required 
                   className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Password</label>
            <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required 
                   className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition" />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Select Role</label>
            <select name="role" value={formData.role} onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition cursor-pointer">
              <option value="member">Library Member</option>
              <option value="admin">System Admin</option>
            </select>
          </div>
          
          <button type="submit" 
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-100 hover:shadow-none active:scale-[0.98] transition duration-150 mt-2">
            Register
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;