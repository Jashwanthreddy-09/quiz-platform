import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Trophy, ArrowRight, ShieldCheck, Zap, Sparkles, Layout, Globe, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Blobs */}
      <div className="blob w-[500px] h-[500px] bg-indigo-600/20 top-[-10%] left-[-10%]" />
      <div className="blob w-[400px] h-[400px] bg-purple-600/20 bottom-[-10%] right-[-10%] delay-700" />
      <div className="blob w-[300px] h-[300px] bg-cyan-600/10 top-[40%] right-[20%] delay-1000" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              QuizMaster
            </span>
          </div>
          <div className="flex items-center gap-8">
            <Link to="/login" className="hidden sm:block text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-premium flex items-center gap-2 group">
              Start Building <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
          >
            <Sparkles className="w-4 h-4" /> 
            Revolutionizing Assessments
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-extrabold text-white leading-[1.1] tracking-tight mb-8"
          >
            Precision Tools for <br className="hidden md:block"/>
            <span className="premium-gradient-text">
              Expert Evaluators.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            The premium platform for educators and engineering teams. Conduct flawless assessments with real-time analytics, secure testing environments, and automated grading.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/register" className="btn-premium px-10 py-5 text-lg flex items-center gap-3">
              Get Started for Free <Zap className="w-5 h-5 fill-current" />
            </Link>
            <button className="px-10 py-5 text-lg font-semibold text-white border border-white/10 rounded-xl hover:bg-white/5 transition-all">
              Watch Product Tour
            </button>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 max-w-4xl mx-auto"
          >
            {[
              { label: 'Users Active', value: '50k+', icon: Users },
              { label: 'Quizzes Taken', value: '2M+', icon: Layout },
              { label: 'Global Reach', value: '150+', icon: Globe },
              { label: 'Success Rate', value: '99.9%', icon: Trophy },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <stat.icon className="w-5 h-5 text-indigo-400 mb-2 opacity-60" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </header>

      {/* Feature Cards Section */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Built for Scaling Teams</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Powerful features designed to make assessment creation and management a breeze.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Advanced Study Sets",
              desc: "Create comprehensive learning pathways with rich media and interactive modules.",
              icon: BookOpen,
              color: "indigo"
            },
            {
              title: "Real-time Analytics",
              desc: "Deep dive into performance data with beautiful visualizations and exportable reports.",
              icon: Zap,
              color: "purple"
            },
            {
              title: "Secure Environment",
              desc: "Military-grade proctoring with tab detention and secure server-side validation.",
              icon: ShieldCheck,
              color: "cyan"
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-10 rounded-[2.5rem] group hover:border-indigo-500/30 transition-all duration-500"
            >
              <div className={`w-14 h-14 bg-${feature.color}-500/10 rounded-2xl flex items-center justify-center mb-8 border border-${feature.color}-500/20 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-6 border-t border-white/5 text-center">
         <div className="flex items-center justify-center gap-3 mb-6">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            <span className="text-xl font-black text-white">QuizMaster</span>
         </div>
         <p className="text-slate-500 text-sm">© 2026 QuizMaster Ecosystem. All rights reserved.</p>
         <div className="flex justify-center gap-8 mt-6">
            {['Privacy', 'Terms', 'Security', 'Status'].map(item => (
              <a key={item} href="#" className="text-xs text-slate-400 hover:text-white transition-colors">{item}</a>
            ))}
         </div>
      </footer>
    </div>
  );
};

export default Home;
