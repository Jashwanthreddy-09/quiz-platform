import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resultService } from '../services/api';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileText,
  Zap,
  Star,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResultDetail = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedIndices, setExpandedIndices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await resultService.getDetail(resultId);
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch result detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resultId]);

  const toggleExpand = (index) => {
    setExpandedIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Analyzing Results...</p>
    </div>
  );

  if (!data) return (
    <div className="glass-card p-12 text-center rounded-[2.5rem] border border-red-500/20 max-w-2xl mx-auto shadow-2xl">
       <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
       <h2 className="text-2xl font-bold text-white mb-2">Analysis Failed</h2>
       <p className="text-slate-500 mb-8">We couldn't retrieve the requested assessment results.</p>
       <button onClick={() => navigate('/dashboard')} className="btn-premium px-8 py-3 text-sm">Return Home</button>
    </div>
  );

  const { summary, details } = data;
  const isPassed = summary.score >= summary.passing_percentage;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Header & Score Card */}
      <div className="glass-card rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden border-white/5 shadow-2xl">
        {/* Background Sparkles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full" />

        <button 
          onClick={() => navigate('/dashboard')}
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold z-10 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Dashboard
        </button>

        <button 
          onClick={() => window.print()}
          className="absolute top-8 right-8 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-all font-bold bg-indigo-500/10 px-4 py-2 rounded-xl z-20 border border-indigo-500/20 shadow-lg shadow-indigo-500/5 group print:hidden"
        >
          <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" /> Download PDF
        </button>

        <div className="absolute top-2 right-2 print:hidden">
          <button 
            onClick={() => navigate(`/leaderboard/${summary.quiz_id}`)}
            className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-all font-bold bg-amber-500/10 px-4 py-2 rounded-xl z-10 border border-amber-500/20 shadow-lg shadow-amber-500/5 group"
          >
            <Trophy className="w-4 h-4 group-hover:scale-110 transition-transform" /> Leaderboard
          </button>
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="mb-8 relative inline-block"
        >
          <div className="absolute -inset-8 bg-indigo-500/10 blur-3xl rounded-full" />
          <div className={`text-8xl md:text-9xl font-black mb-4 relative z-10 ${isPassed ? 'premium-gradient-text' : 'text-red-400'}`}>
            {summary.score}%
          </div>
          <div className={`inline-flex items-center gap-2 uppercase tracking-[0.2em] font-black text-[10px] px-6 py-2 rounded-full relative z-10 border ${isPassed ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
            {isPassed ? <><Star className="w-3 h-3 fill-current" /> Mastery Achieved</> : <><AlertCircle className="w-3 h-3" /> Minimum Scope Not Met</>}
          </div>
        </motion.div>

        <h1 className="text-3xl font-black text-white relative z-10 uppercase tracking-tight">{summary.quiz_title}</h1>
        
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-12 pt-12 border-t border-white/5 relative z-10">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Metrics</p>
            <p className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" /> {summary.duration || 'N/A'} MINS
            </p>
          </div>
          <div className="text-center h-12 w-px bg-white/5 hidden md:block" />
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Accuracy</p>
            <p className="text-xl font-bold text-white">
              <span className="text-indigo-400">{Math.round((summary.score / 100) * summary.total_questions)}</span> <span className="text-slate-600">/</span> {summary.total_questions}
            </p>
          </div>
          <div className="text-center h-12 w-px bg-white/5 hidden md:block" />
          <div className="text-center">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Requirement</p>
             <p className="text-xl font-bold text-slate-400">{summary.passing_percentage}% <span className="text-[10px] opacity-50 uppercase ml-1 tracking-widest">To Pass</span></p>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-8">
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
           <Activity className="w-6 h-6 text-indigo-400" /> Technical Breakdown
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {details.map((q, idx) => {
            const isCorrect = q.student_answer === q.correct_answer;
            const isExpanded = expandedIndices.includes(idx);

            return (
              <div 
                key={idx} 
                className={`glass-card rounded-[2.5rem] overflow-hidden transition-all duration-300 border ${
                  isCorrect ? 'hover:border-emerald-500/20' : 'hover:border-red-500/20'
                }`}
              >
                <div 
                  onClick={() => toggleExpand(idx)}
                  className="p-8 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-6">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCorrect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-1">Module {idx + 1}</p>
                        <p className="font-bold text-white text-lg line-clamp-1 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{q.question_text}</p>
                     </div>
                  </div>
                  <div className={`p-2 rounded-full bg-white/5 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-400' : 'text-slate-500'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 p-10 space-y-8 bg-black/20"
                    >
                      <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-bold tracking-tight">{q.question_text}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                         <div className="bg-white/2 p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 p-4 opacity-5 ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                                {isCorrect ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                            </div>
                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-4">Your Intel</p>
                            <pre className={`text-sm font-mono whitespace-pre-wrap p-4 rounded-xl bg-black/40 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                              {q.student_answer || 'NO RESPONSE SUBMITTED'}
                            </pre>
                         </div>
                         <div className="bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-400">
                                <Zap className="w-12 h-12" />
                            </div>
                            <p className="text-[10px] uppercase font-black text-indigo-400/50 tracking-widest mb-4">Correct Protocol</p>
                            <pre className="text-sm font-mono whitespace-pre-wrap p-4 rounded-xl bg-black/40 text-indigo-400">
                              {q.correct_answer}
                            </pre>
                         </div>
                      </div>

                      {q.explanation && (
                        <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 flex gap-5">
                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 shrink-0">
                              <HelpCircle className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-2">Insight & Rationale</p>
                              <p className="text-sm text-slate-300 leading-relaxed font-medium">{q.explanation}</p>
                           </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultDetail;
