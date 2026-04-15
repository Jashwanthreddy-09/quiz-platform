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
  FileText
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

  if (loading) return <div className="text-slate-900 p-10">Analyzing your performance...</div>;
  if (!data) return <div className="text-slate-900 p-10">Result not found.</div>;

  const { summary, details } = data;
  const isPassed = summary.score >= summary.passing_percentage;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Header & Score Card */}
      <div className="bg-white shadow-xl shadow-slate-200/50 border border-slate-200 rounded-[3rem] p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="w-64 h-64 text-primary" />
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-bold z-10"
        >
          <ArrowLeft className="w-5 h-5" /> Dashboard
        </button>

        <button 
          onClick={() => navigate(`/leaderboard/${summary.quiz_id}`)}
          className="absolute top-8 right-8 flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors font-bold bg-amber-500/10 px-4 py-2 rounded-xl z-10 border border-amber-500/20 shadow-lg"
        >
          <Trophy className="w-4 h-4" /> View Leaderboard
        </button>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6 inline-block"
        >
          <div className={`text-7xl font-black mb-2 ${isPassed ? 'text-accent' : 'text-red-400'}`}>
            {summary.score}%
          </div>
          <div className={`uppercase tracking-widest font-black text-sm px-4 py-1.5 rounded-full ${isPassed ? 'bg-accent/10 text-accent' : 'bg-red-500/10 text-red-500'}`}>
            {isPassed ? 'Successfully Passed' : 'Did Not Pass'}
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold mb-4">{summary.quiz_title}</h1>
        
        <div className="flex items-center justify-center gap-12 mt-8 py-6 border-t border-slate-200">
          <div className="text-center">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Duration</p>
            <p className="text-lg font-bold flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> {summary.duration || 'N/A'} Mins
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Correct Answers</p>
            <p className="text-lg font-bold">
              {Math.round((summary.score / 100) * summary.total_questions)} / {summary.total_questions}
            </p>
          </div>
          <div className="text-center">
             <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Requirement</p>
             <p className="text-lg font-bold text-slate-600">{summary.passing_percentage}% to pass</p>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
           <FileText className="w-6 h-6 text-primary" /> Performance Breakdown
        </h2>

        <div className="space-y-4">
          {details.map((q, idx) => {
            const isCorrect = q.student_answer === q.correct_answer;
            const isExpanded = expandedIndices.includes(idx);

            return (
              <div 
                key={idx} 
                className={`bg-white shadow-lg border rounded-[2rem] overflow-hidden transition-all ${
                  isCorrect ? 'border-accent/20' : 'border-red-500/20'
                }`}
              >
                <div 
                  onClick={() => toggleExpand(idx)}
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-white shadow-xl shadow-slate-200/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                     <div className={`p-2 rounded-xl ${isCorrect ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-400'}`}>
                        {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                     </div>
                     <div>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-tighter mb-0.5">Question {idx + 1}</p>
                        <p className="font-bold line-clamp-1">{q.question_text}</p>
                     </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-200 p-8 space-y-6"
                    >
                      <p className="text-lg text-slate-700 leading-relaxed font-medium">{q.question_text}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                         <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-3">Your Answer</p>
                            <p className={`font-bold ${isCorrect ? 'text-accent' : 'text-red-400'}`}>
                              {q.student_answer || '< No Answer Provided >'}
                            </p>
                         </div>
                         <div className="bg-accent/5 p-6 rounded-2xl border border-accent/10">
                            <p className="text-[10px] uppercase font-black text-accent/50 tracking-widest mb-3">Correct Answer</p>
                            <p className="font-bold text-accent">
                              {q.correct_answer}
                            </p>
                         </div>
                      </div>

                      {q.explanation && (
                        <div className="bg-indigo-500/5 p-6 rounded-2xl border border-primary/10 flex gap-4">
                           <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                           <div>
                              <p className="text-[10px] uppercase font-black text-primary tracking-widest mb-1">Explanation</p>
                              <p className="text-sm text-slate-600 leading-relaxed">{q.explanation}</p>
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
