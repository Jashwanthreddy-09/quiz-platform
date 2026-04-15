import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { GraduationCap, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col md:flex-row-reverse bg-slate-50 font-sans">
      
      {/* Right Branding Panel */}
      <div className="hidden md:flex flex-col justify-between w-5/12 bg-purple-600 p-12 text-white relative overflow-hidden">
        <div className="relative z-10 flex justify-end">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight text-white">QuizMaster</span>
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
          </Link>
        </div>
        
        <div className="relative z-10 mb-20 text-right">
          <h2 className="text-4xl font-black text-white leading-tight mb-6">
            Join the future of <br />
            <span className="text-purple-200">learning.</span>
          </h2>
          <p className="text-purple-100 font-medium text-lg ml-auto max-w-sm">
            Create an account to participate in live exams, view detailed performance analytics, and compete on the leaderboard.
          </p>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-10 -left-20 w-72 h-72 bg-indigo-500 rounded-full blur-3xl opacity-40"></div>
      </div>

      {/* Left Registration Form */}
      <div className="flex-1 flex justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center justify-center gap-2 mb-10 w-full">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-md">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800 mt-2">QuizMaster</span>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 w-full">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center md:text-left">Create Account</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-12 text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                  <input 
                    type="email" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-12 text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent outline-none transition-all"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                  <input 
                    type="password" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-12 text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Account Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="student">Student Account</option>
                  <option value="admin">Instructor / Admin</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-4"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="mt-8 text-center text-slate-500 text-sm font-medium">
              Already have an account? {' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-bold transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
