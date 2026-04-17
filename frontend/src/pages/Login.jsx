import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { GraduationCap, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        login(payload, token);
      } catch (e) {
        setError('Failed to authenticate with Google');
      }
    }
  }, [location, login]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      login(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      {/* Background Blobs */}
      <div className="blob w-[600px] h-[600px] bg-indigo-600/10 -top-20 -left-20" />
      <div className="blob w-[500px] h-[500px] bg-purple-600/10 -bottom-20 -right-20 delay-700" />

      <div className="w-full max-w-5xl grid md:grid-cols-2 glass-card rounded-[2.5rem] overflow-hidden">
        {/* Left Panel - Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-indigo-600/10 relative">
          <Link to="/" className="flex items-center gap-3 relative z-10 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">QuizMaster</span>
          </Link>

          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-6"
            >
              <Sparkles className="w-3 h-3" /> Secure Access
            </motion.div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">
              Welcome back to <br />
              <span className="premium-gradient-text">the future of assessment.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Experience the next generation of online testing with real-time analytics and military-grade security.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            © 2026 QuizMaster Ecosystem
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h3 className="text-3xl font-bold text-white mb-2">Sign In</h3>
            <p className="text-slate-400">Enter your credentials to access your dashboard</p>
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
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                <a href="#" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">Forgot password?</a>
              </div>
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

            <button 
              type="submit"
              disabled={isLoading}
              className="btn-premium w-full flex items-center justify-center gap-2 mt-4 text-white"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="relative my-8 text-center flex items-center justify-center">
            <div className="absolute w-full border-t border-white/5"></div>
            <span className="relative px-4 bg-[#030712] text-slate-500 text-xs font-bold uppercase tracking-widest">
              Or continue with
            </span>
          </div>

          <div className="flex justify-center mb-10 overflow-hidden rounded-xl">
            <GoogleLogin 
              onSuccess={(credentialResponse) => {
                console.log(credentialResponse);
                alert("Google Client connected. Awaiting backend integration.");
              }}
              onError={() => setError('Google Login Failed')}
              theme="filled_black"
              shape="pill"
              size="large"
            />
          </div>

          <p className="text-center text-slate-400 text-sm">
            Don't have an account? {' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Create one for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
