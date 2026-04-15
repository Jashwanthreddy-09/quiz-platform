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
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      
      {/* Mobile Header (Only visible on small screens) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-800">QuizMaster</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-64 bg-white border-r border-slate-200 fixed md:sticky top-[73px] md:top-0 h-[calc(100vh-73px)] md:h-screen z-40`}>
        <div className="hidden md:flex p-6 items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-800">QuizMaster</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                ? 'bg-indigo-50 text-indigo-700 font-bold' 
                : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop Header */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-30">
          <h2 className="text-xl font-bold text-slate-800">
            {menuItems.find(i => location.pathname.includes(i.path))?.name || 'Overview'}
          </h2>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name || 'Student'}</p>
                <p className="text-xs text-slate-500 font-medium">Student Account</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                {user?.name?.[0] || 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <div className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-y-auto">
          {children}
        </div>
      </main>

    </div>
  );
};

export default StudentLayout;
