import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { GraduationCap, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

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
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* Left Branding Panel */}
      <div className="hidden md:flex flex-col justify-between w-5/12 bg-indigo-600 p-12 text-white relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">QuizMaster</span>
        </div>
        
        <div className="relative z-10 mb-20">
          <h2 className="text-4xl font-black leading-tight mb-6 text-white">
            Log in to your <br />
            <span className="text-indigo-200">workspace.</span>
          </h2>
          <p className="text-indigo-100 font-medium text-lg max-w-sm">
            Access your secure assessments, track student performance, and leverage real-time analytics.
          </p>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-10 -right-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-40"></div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center justify-center gap-2 mb-10 w-full">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800 mt-2">QuizMaster</span>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 w-full">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center md:text-left">Welcome Back</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="email" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-12 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none transition-all"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="password" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-12 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-4"
              >
                {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative my-8 text-center flex items-center justify-center w-full">
              <div className="absolute w-full border-t border-slate-200"></div>
              <span className="relative px-3 bg-white text-slate-400 text-sm font-medium">Or continue with</span>
            </div>

            <div className="flex justify-center w-full">
              <GoogleLogin 
                onSuccess={(credentialResponse) => {
                  console.log(credentialResponse);
                  alert("Google Client connected. Awaiting backend integration.");
                }}
                onError={() => setError('Google Login Failed')}
                theme="outline"
                shape="pill"
                size="large"
              />
            </div>

            <p className="mt-8 text-center text-slate-500 text-sm font-medium">
              Don't have an account? {' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
