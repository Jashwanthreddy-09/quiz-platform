import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, ArrowRight, Zap, Clock, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../services/api';

const MyExams = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await quizService.getAll();
      setQuizzes(response.data);
    } catch (err) {
      console.error("Failed to fetch quizzes", err);
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = (index) => {
    const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-cyan-500', 'bg-emerald-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-10">
      <section>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-indigo-500" />
            My <span className="premium-gradient-text">Assessments</span>
          </h1>
          <p className="text-slate-400 font-medium">Browse and participate in active exam sessions.</p>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="glass-card h-64 rounded-[2rem] animate-pulse bg-white/5" />
          ))
        ) : quizzes.map((quiz, index) => (
          <motion.div 
            key={quiz.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            onClick={() => navigate(`/exam/attempt/${quiz.id}`)}
            className="glass-card group rounded-[2.5rem] p-8 border-white/5 hover:border-indigo-500/30 cursor-pointer overflow-hidden relative"
          >
            <div className={`absolute -right-10 -top-10 w-32 h-32 blur-3xl opacity-10 rounded-full ${getRandomColor(index)} group-hover:opacity-20 transition-opacity`} />
            
            <div className="relative z-10">
              <div className={`w-12 h-12 ${getRandomColor(index)}/10 border border-white/10 rounded-xl flex items-center justify-center mb-6`}>
                <Zap className={`w-5 h-5 ${getRandomColor(index).replace('bg-', 'text-')}`} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{quiz.title}</h3>
              <p className="text-slate-500 text-xs font-medium mb-8 line-clamp-2">{quiz.description || 'Standard platform assessment for competitive ranking.'}</p>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{quiz.duration} Mins</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{quiz.passing_percentage}% Goal</span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                 <button className="flex items-center gap-3 px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/40 group-hover:bg-indigo-400 transition-all">
                   Start Assessment
                   <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!loading && quizzes.length === 0 && (
        <div className="glass-card p-20 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-500">
           <BookOpen className="w-16 h-16 mb-4 opacity-20" />
           <p className="font-bold text-xl text-white">No active assessments.</p>
           <p className="text-sm uppercase tracking-widest mt-2">Check back soon for upcoming exams.</p>
        </div>
      )}
    </div>
  );
};

export default MyExams;
