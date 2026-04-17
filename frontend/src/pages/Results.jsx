import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resultService } from '../services/api';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await resultService.getHistory();
        setResults(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Loading History...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <section>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
            <Award className="w-10 h-10 text-purple-500" />
            Performance <span className="premium-gradient-text">Results</span>
          </h1>
          <p className="text-slate-400 font-medium">Track your progress and analyze your past exam scores.</p>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 gap-6">
        {results.map((res, idx) => (
          <motion.div
            key={res.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => navigate(`/results/${res.id}`)}
            className="glass-card group p-8 rounded-[2rem] border-white/5 hover:border-indigo-500/30 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${res.score >= 50 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {res.score}%
               </div>
               <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{res.quiz_title}</h3>
                  <div className="flex items-center gap-4 mt-2">
                     <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {res.time_taken}s
                     </span>
                     <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> {new Date(res.completed_at).toLocaleDateString()}
                     </span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all">
                  Analysis Detail
                </button>
            </div>
          </motion.div>
        ))}

        {results.length === 0 && (
          <div className="glass-card p-20 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-500 min-h-[400px]">
             <Award className="w-16 h-16 mb-4 opacity-20" />
             <p className="font-bold text-xl text-white">No results found.</p>
             <p className="text-sm uppercase tracking-widest mt-2">Complete an assessment to view your results here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
