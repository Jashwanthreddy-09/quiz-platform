import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService, questionService, quizService } from '../services/api';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Send,
  Circle,
  CheckCircle2,
  AlertCircle,
  Shield,
  Zap,
  Layout,
  Maximize2,
  AlignLeft,
  Code2,
  AlertTriangle,
  ArrowLeft,
  Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeIDE from '../components/CodeIDE';

const ExamAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);


  useEffect(() => {
    fetchInitialData();
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handleSecurityBreach = () => {
      if (loading || submitting) return;
      setWarningCount(prev => {
        const next = prev + 1;
        if (next >= 3) {
          handleSubmit();
          return next;
        }
        setShowWarning(true);
        return next;
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleSecurityBreach);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) handleSecurityBreach();
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleSecurityBreach);
      document.removeEventListener('visibilitychange', handleSecurityBreach);
    };
  }, [loading, submitting]);

  const fetchInitialData = async () => {
    try {
      const [quizRes, qRes] = await Promise.all([
        quizService.getById(quizId),
        examService.getQuestions(quizId)
      ]);
      setQuiz(quizRes.data);
      
      const fetchedQs = qRes.data;
      if (fetchedQs.length === 0) {
        console.warn('0 questions fetched');
      }
      
      const mappedQuestions = fetchedQs.map(q => ({
        id: q.question_id,
        type: q.question_type,
        text: q.question_text,
        options: q.question_type === 'coding' ? { language: 'javascript', testCases: q.testCases } : q.options,
        correct_answer: q.correct_answer,
        marks: q.marks
      }));
      setQuestions(mappedQuestions);

      const attemptRes = await examService.start(quizId);
      setAttemptId(attemptRes.data.attemptId);

      const timeRes = await examService.getTimeRemaining(attemptRes.data.attemptId);
      setTimeLeft(timeRes.data.remaining);

      const progressRes = await examService.getProgress(attemptRes.data.attemptId);
      const savedAnswers = {};
      const savedFlags = {};
      progressRes.data.forEach(a => {
        savedAnswers[a.question_id] = a.answer;
        savedFlags[a.question_id] =!!a.is_flagged;
      });
      setAnswers(savedAnswers);
      setFlags(savedFlags);

      const cachedIndex = localStorage.getItem(`exam_index_${attemptRes.data.attemptId}`);
      if (cachedIndex) setCurrentIndex(parseInt(cachedIndex));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 0 && !loading && attemptId) {
      handleSubmit();
      return;
    }
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, loading, attemptId]);

  useEffect(() => {
    const syncer = setInterval(async () => {
      if (attemptId && !loading) {
        try {
          const res = await examService.getTimeRemaining(attemptId);
          setTimeLeft(res.data.remaining);
        } catch (err) {
          console.error("Time sync failed");
        }
      }
    }, 30000);
    return () => clearInterval(syncer);
  }, [attemptId, loading]);

  useEffect(() => {
    localStorage.setItem(`exam_index_${attemptId}`, currentIndex);
    const saver = setInterval(() => {
      const qId = questions[currentIndex]?.id;
      if (qId) {
        saveProgress(qId, answers[qId]);
      }
    }, 3000);
    return () => clearInterval(saver);
  }, [currentIndex, answers, questions, attemptId]);

  const saveProgress = async (qId, val) => {
    try {
      setIsSaving(true);
      await examService.save({ 
        attemptId, 
        questionId: qId, 
        answer: val || '',
        isFlagged: flags[qId] 
      });
    } catch (err) {
      if (err.response?.data?.expired) {
        navigate('/results');
      }
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleAnswerChange = (val) => {
    const qId = questions[currentIndex].id;
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Transform answers object to array format as required by new API
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        question_id: parseInt(qId),
        answer: val
      }));

      const payload = {
        exam_id: parseInt(quizId),
        student_id: user.id,
        attemptId: parseInt(attemptId),
        answers: formattedAnswers
      };

      console.log("[DEBUG] Final submission payload:", payload);

      const res = await examService.submit(payload);

      if (res.data.success) {
        navigate(`/results/${res.data.resultId}`);
      } else {
        throw new Error(res.data.message || "Submission failed");
      }
    } catch (err) {
      console.error("Submission Error Details:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || err.message || "An unexpected error occurred.";
      alert(`Submission failed: ${errorMsg}\n\nPlease contact support if this persists.`);
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return (
    <div className="fixed inset-0 bg-[#030712] flex flex-col items-center justify-center text-white z-[100]">
      <div className="blob w-[300px] h-[300px] bg-indigo-500/20 blur-3xl" />
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6 relative z-10" />
      <h2 className="text-2xl font-black relative z-10 uppercase tracking-widest text-indigo-400">Securing Session...</h2>
      <p className="text-slate-500 mt-2 font-medium">Please do not refresh the page.</p>
    </div>
  );

  if (questions.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6">
        <div className="glass-card p-12 text-center rounded-[2.5rem] border border-red-500/20 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/10 blur-[80px] rounded-full" />
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6 relative z-10" />
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight relative z-10">Configuration Error</h2>
            <p className="text-slate-400 mb-10 leading-relaxed relative z-10">This assessment currently has no evaluation modules configured. <br/>Please contact your instructor to verify the question bank.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="btn-premium px-10 py-4 text-xs flex items-center justify-center gap-2 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Return to Command Center
              </button>
            </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || null;

  return (
    <div className="fixed inset-0 bg-[#030712] text-slate-200 flex overflow-hidden z-[90]">
      {/* Question Palette Sidebar */}
      <aside className="hidden lg:flex flex-col w-80 bg-slate-950/50 backdrop-blur-xl border-r border-white/5 h-full">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Secure Session</span>
          </div>
          <h1 className="text-xl font-black text-white truncate">{quiz?.title}</h1>
          <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">Candidate: Verified Access</p>
        </div>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Execution Palette</p>
          <div className="grid grid-cols-5 gap-3">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all border ${currentIndex === i
                  ? 'bg-indigo-500 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] scale-110 z-10'
                  : flags[q.id]
                    ? 'border-amber-500 text-amber-500 bg-amber-500/5 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                    : answers[q.id]
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                  }`}
              >
                {flags[q.id] && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-slate-950" />}
                {String(i + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 bg-slate-900/20 border-t border-white/5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Completion Progress</span>
            <span className="text-xs font-black text-indigo-400">{Math.round((Object.keys(answers).length / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
              className="bg-indigo-500 h-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            />
          </div>
        </div>
      </aside>

      {/* Main Examination Console */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* Top Console Bar */}
        <header className="h-20 bg-slate-950/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 lg:px-12 shrink-0">
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all ${timeLeft < 300 ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-white/5 border-white/10 text-white'}`}>
              <Clock className={`w-5 h-5 ${timeLeft < 300 ? 'animate-pulse' : 'text-indigo-400'}`} />
              <span className="text-xl font-black font-mono tracking-tighter">{formatTime(timeLeft)}</span>
            </div>
            <AnimatePresence>
              {isSaving && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" /> Syncing Progress
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-premium px-10 py-2.5 text-xs text-white"
            >
              {submitting ? 'Terminating...' : 'Submit Assessment'}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto py-16 px-8 lg:py-24 lg:px-12 h-full">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-12 h-full flex flex-col"
            >
              <div className="flex items-center gap-4">
                  <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black px-4 py-1.5 rounded-full border border-indigo-500/20 uppercase tracking-[0.2em]">Module {currentIndex + 1}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{currentQ?.marks} Unit Points</span>
                  
                  <button 
                    onClick={() => setFlags(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
                    className={`ml-auto flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${flags[currentQ.id] ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-white/5 border-white/10 text-slate-500 hover:border-slate-400'}`}
                  >
                    <Zap className={`w-3 h-3 ${flags[currentQ.id] ? 'fill-current' : ''}`} />
                    {flags[currentQ.id] ? 'Flagged for Review' : 'Mark for Review'}
                  </button>
                </div>

                <h2 className="text-3xl lg:text-5xl font-extrabold text-white leading-[1.2] tracking-tight">{currentQ?.text}</h2>

                <div className="flex-1 flex flex-col">
                  {currentQ?.type === 'mcq' && currentQ?.options && currentQ.options.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 max-w-2xl">
                      {currentQ.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswerChange(option)}
                          className={`flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${answers[currentQ.id] === option
                            ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_40px_rgba(99,102,241,0.1)]'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/5'
                            }`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-inner ${answers[currentQ.id] === option ? 'bg-indigo-500 text-white animate-bounce-short' : 'bg-slate-800 text-slate-500 group-hover:text-white'}`}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-xl font-bold">{option}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {currentQ?.type === 'mcq' && (!currentQ?.options || currentQ.options.length === 0) && (
                    <div className="flex-1 flex items-center justify-center text-slate-500 space-y-4 py-8 bg-red-500/5 rounded-3xl border border-red-500/10">
                      <div className="text-center">
                        <p className="font-bold text-red-400 text-lg">Corrupted Module Configuration</p>
                        <p className="text-sm mt-2 text-slate-400 max-w-md mx-auto">
                          This question is marked as a Multiple Choice module but has no selectable options attached to its payload. Please ask your administrator to delete & recreate this question correctly using the new Question Builder.
                        </p>
                      </div>
                    </div>
                  )}

                  {currentQ?.type === 'short_answer' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-widest px-1">
                        <AlignLeft className="w-3.5 h-3.5" /> Drafting Response
                      </div>
                      <textarea
                        className="w-full bg-white/5 border-2 border-white/5 rounded-[2.5rem] p-10 text-xl text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-700 font-medium shadow-inner"
                        rows="8"
                        placeholder="Write your detailed technical response here... Your progress is saved automatically."
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                      />
                    </div>
                  )}

                  {currentQ?.type === 'coding' && (
                    <div className="flex flex-col h-full space-y-4">
                      {currentQ?.options?.testCases?.length > 0 && (
                        <div className="bg-[#1e1e1e] border border-white/5 rounded-2xl p-4 mt-2 grid grid-cols-2 gap-4">
                          {currentQ.options.testCases.map((tc, idx) => (
                            <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2">
                              <span className="text-[10px] font-black uppercase text-indigo-400">Test Case {idx + 1}</span>
                              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                <div className="bg-black/40 p-2 rounded text-slate-300"><span className="text-slate-500 mr-2">IN</span>{tc.input}</div>
                                <div className="bg-black/40 p-2 rounded text-emerald-400"><span className="text-slate-500 mr-2">OUT</span>{tc.output}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-widest px-1">
                        <Code2 className="w-3.5 h-3.5" /> Logic Implementation
                      </div>
                      <div className="flex-1 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl min-h-[400px]">
                        <CodeIDE
                          initialCode={answers[currentQ.id] || currentQ.correct_answer || ''}
                          onCodeChange={handleAnswerChange}
                          language={currentQ.options?.language || 'javascript'}
                        />
                      </div>
                    </div>
                  )}

                  {!['mcq', 'short_answer', 'coding'].includes(currentQ?.type) && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4 py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                      <AlertCircle className="w-12 h-12 opacity-20" />
                      <div className="text-center">
                        <p className="font-bold text-white text-lg">Module Sequence Interrupted</p>
                        <p className="text-xs uppercase tracking-widest mt-1">
                          {currentQ ? `Question Type [${currentQ.type}] is not supported in this build.` : 'No content found for this evaluation module.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
          </div>
        </div>

        {/* Security Warning Modal */}
        <AnimatePresence>
          {showWarning && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-red-500/30 p-10 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl"
              >
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                  <Shield className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Security Violation</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Tab switching or window minimization is prohibited during this session. This event has been logged.
                </p>
                
                <div className="bg-red-500/5 border border-red-500/10 py-3 rounded-2xl mb-8">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Strike {warningCount} of 3</p>
                  <p className="text-xs font-bold text-slate-500 mt-1">Automatic termination upon next strike.</p>
                </div>

                <button 
                  onClick={() => setShowWarning(false)}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-xs"
                >
                  I Understand
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Console Navigation Bar */}
        <footer className="h-24 bg-slate-950/50 backdrop-blur-md border-t border-white/5 flex items-center justify-between px-8 lg:px-12 shrink-0">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="flex items-center gap-3 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-10 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Previous Module
          </button>

          <div className="hidden md:flex items-center gap-4">
            {questions.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${currentIndex === i ? 'w-12 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : answers[questions[i].id] ? 'w-4 bg-emerald-500/50' : 'w-4 bg-white/5'}`} />
            ))}
          </div>

          <button
            disabled={currentIndex === questions.length - 1}
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all disabled:opacity-10 group"
          >
            Next Module <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </footer>
      </main>
    </div>
  );
};

export default ExamAttempt;
