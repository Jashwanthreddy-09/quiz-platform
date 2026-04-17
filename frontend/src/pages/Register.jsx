import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { GraduationCap, Mail, Lock, User, AlertCircle, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await authService.register({ name, email, password, role });
      navigate('/login?registered=true');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      {/* Background Blobs */}
      <div className="blob w-[600px] h-[600px] bg-purple-600/10 -top-20 -right-20" />
      <div className="blob w-[500px] h-[500px] bg-indigo-600/10 -bottom-20 -left-20 delay-700" />

      <div className="w-full max-w-5xl grid md:grid-cols-2 glass-card rounded-[2.5rem] overflow-hidden">
        {/* Left Panel - Form */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 md:order-1">
          <div className="mb-10">
            <h3 className="text-3xl font-bold text-white mb-2">Create Account</h3>
            <p className="text-slate-400">Join thousands of students and educators today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
              </motion.div>
            )}

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text" 
                    required
                    className="input-premium pl-12"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="email" 
                    required
                    className="input-premium pl-12"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="password" 
                    required
                    className="input-premium pl-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Account Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-premium appearance-none bg-[#030712]"
                >
                  <option value="student">Student Account</option>
                  <option value="admin">Instructor / Admin</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="btn-premium w-full flex items-center justify-center gap-2 mt-4 text-white"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-8">
            Already have an account? {' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Sign in</Link>
          </p>
        </div>

        {/* Right Panel - Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-purple-600/10 relative order-1 md:order-2">
          <Link to="/" className="flex items-center gap-3 relative z-10 group justify-end">
            <span className="text-2xl font-black tracking-tight text-white">QuizMaster</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
          </Link>

          <div className="relative z-10 text-right">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-widest mb-6"
            >
              <ShieldCheck className="w-3 h-3" /> Privacy Focused
            </motion.div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">
              Empower your <br />
              <span className="premium-gradient-text">learning journey.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed ml-auto max-w-xs">
              Take control of your assessments with our powerful suite of tools designed for excellence.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium text-right">
            By creating an account, you agree to our Terms.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
