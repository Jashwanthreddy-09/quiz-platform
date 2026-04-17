import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Award, 
  User, 
  Bell,
  LogOut,
  GraduationCap,
  Menu,
  X,
  Search,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const StudentLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'My Exams', icon: BookOpen, path: '/exams' },
    { name: 'Results', icon: Award, path: '/results' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans flex flex-col md:flex-row">
      <div className="blob w-[500px] h-[500px] bg-indigo-600/5 top-0 left-0" />

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">QuizMaster</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-400">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(mobileMenuOpen || !window.matchMedia('(max-width: 768px)').matches) && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`${mobileMenuOpen ? 'fixed inset-0 z-40' : 'hidden'} md:flex flex-col w-full md:w-72 bg-slate-950/50 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0`}
          >
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="p-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">QuizMaster</span>
            </Link>

            <nav className="flex-1 px-6 py-4 space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Navigation</p>
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    location.pathname === item.path 
                    ? 'bg-indigo-500/10 text-indigo-400 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)] border border-indigo-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${location.pathname === item.path ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                  <span className="font-semibold">{item.name}</span>
                </Link>
              ))}

              <div className="pt-8">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Support</p>
                <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                  <Settings className="w-5 h-5 text-slate-500" />
                  <span className="font-semibold">Settings</span>
                </Link>
              </div>
            </nav>

            <div className="p-6 border-t border-white/5 bg-slate-900/20">
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-indigo-400 font-bold shadow-inner">
                  {user?.name?.[0] || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user?.name || 'Student'}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Free Plan</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-bold transition-all group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search assessments..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#030712]"></span>
            </button>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-tight">{user?.name || 'Student'}</p>
                <div className="flex items-center gap-1 justify-end">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Online</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           <div className="max-w-7xl mx-auto p-6 md:p-10">
              {children}
           </div>
        </div>
      </main>

    </div>
  );
};

export default StudentLayout;
