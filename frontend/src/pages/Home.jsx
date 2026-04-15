import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Trophy, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar section - Standard Flow */}
      <nav className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800">QuizMaster</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg">
              Start for free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-200 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm"
          >
            <Trophy className="w-4 h-4 text-amber-500" /> Introducing QuizMaster 3.0
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.2] tracking-tight mb-8"
          >
            Assess talent with <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              colorful precision.
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            The premium platform for educators and engineering teams to conduct flawless, timed assessments, live leaderboards, and code execution environments.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-indigo-500/30 group">
              Get Started Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-sm">
              View Demo Dashboard
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Feature Cards Section */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] border border-slate-200 p-10 shadow-xl shadow-slate-200/50 hover:shadow-indigo-100 hover:-translate-y-1 transition-all"
          >
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Study Sets</h3>
            <p className="text-slate-600 leading-relaxed">Create and share custom study materials with ease. Build comprehensive learning pathways.</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2rem] border border-slate-200 p-10 shadow-xl shadow-slate-200/50 hover:shadow-purple-100 hover:-translate-y-1 transition-all"
          >
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
              <Trophy className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Instant Leaderboards</h3>
            <p className="text-slate-600 leading-relaxed">Gamify your assessments. Track time taken and scores to generate competitive, live rankings.</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2rem] border border-slate-200 p-10 shadow-xl shadow-slate-200/50 hover:shadow-emerald-100 hover:-translate-y-1 transition-all"
          >
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Military-Grade Security</h3>
            <p className="text-slate-600 leading-relaxed">Tab-switching detection, strict server-side timelines, and JWT-authenticated secured attempts.</p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-slate-400 py-12 text-center text-sm border-t border-slate-800 mt-10">
         <p className="font-medium">© 2026 QuizMaster. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
