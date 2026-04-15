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
  AlertCircle
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
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
    
    // Prevent reload
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const fetchInitialData = async () => {
    try {
      const [quizRes, qRes] = await Promise.all([
        quizService.getById(quizId),
        questionService.getByQuiz(quizId)
      ]);
      setQuiz(quizRes.data);
      setQuestions(qRes.data);

      const attemptRes = await examService.start(quizId);
      setAttemptId(attemptRes.data.attemptId);

      // 1. authoritative Time Sync from Server
      const timeRes = await examService.getTimeRemaining(attemptRes.data.attemptId);
      setTimeLeft(timeRes.data.remaining);

      // 2. Load existing progress
      const progressRes = await examService.getProgress(attemptRes.data.attemptId);
      const savedAnswers = {};
      progressRes.data.forEach(a => savedAnswers[a.question_id] = a.answer);
      setAnswers(savedAnswers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0 && !loading && attemptId) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, attemptId]);

  // Sync with server every 30 seconds for accuracy
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

  // Auto-save logic (every 3 seconds if changes exist)
  useEffect(() => {
    const saver = setInterval(() => {
      const qId = questions[currentIndex]?.id;
      if (qId && answers[qId] !== undefined) {
        saveProgress(qId, answers[qId]);
      }
    }, 3000);
    return () => clearInterval(saver);
  }, [currentIndex, answers, questions]);

  const saveProgress = async (qId, val) => {
    try {
      setIsSaving(true);
      await examService.save({ attemptId, questionId: qId, answer: val });
    } catch (err) {
      if (err.response?.data?.expired) {
        // Stop Everything and redirect
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
      const res = await examService.submit(attemptId);
      navigate(`/results/${res.data.resultId}`);
    } catch (err) {
      alert("Submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center text-slate-900 z-[100]">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <h2 className="text-xl font-bold">Setting up your exam environment...</h2>
    </div>
  );

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 bg-slate-50 text-slate-100 flex overflow-hidden z-[90]">
      {/* Left Sidebar: Palette */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-8 border-b border-slate-200">
          <h1 className="text-xl font-black tracking-tight mb-2">QuizApp <span className="text-primary">Exam</span></h1>
          <p className="text-sm text-slate-500 font-medium truncate">{quiz?.title}</p>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Question Palette</h3>
          <div className="grid grid-cols-5 gap-3">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all border ${
                  currentIndex === i 
                  ? 'bg-primary border-primary text-slate-900 shadow-lg shadow-primary/20 scale-110 z-10' 
                  : answers[q.id] 
                  ? 'bg-accent/10 border-accent/30 text-accent' 
                  : 'bg-white shadow-md border-slate-200 text-slate-500 hover:border-slate-500'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 bg-white/90 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-600">Progress</span>
            <span className="text-xs font-black text-primary">{Object.keys(answers).length}/{questions.length}</span>
          </div>
          <div className="w-full bg-white shadow-md h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-500" 
              style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10">
          <div className="flex items-center gap-4">
             <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${timeLeft < 300 ? 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse' : 'bg-white shadow-md border-slate-200 text-slate-700'}`}>
                <Clock className="w-5 h-5" />
                <span className="text-lg font-black font-mono">{formatTime(timeLeft)}</span>
             </div>
             {isSaving && (
               <div className="flex items-center gap-2 text-xs text-slate-500 font-bold ml-4">
                 <Loader2 className="w-3 h-3 animate-spin" /> Saving...
               </div>
             )}
          </div>

          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-slate-900 px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Finish Exam'} <Send className="w-4 h-4" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12 lg:p-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-primary/10 text-primary text-xs font-black px-3 py-1 rounded-full uppercase">Question {currentIndex + 1}</span>
                <span className="text-slate-500 text-xs font-bold">{currentQ?.marks} Marks</span>
              </div>
              
              <h2 className="text-3xl font-bold leading-tight mb-12">{currentQ?.text}</h2>

              {/* Question Types */}
              {currentQ?.type === 'mcq' && (
                <div className="grid grid-cols-1 gap-4">
                  {currentQ.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswerChange(option)}
                      className={`flex items-center gap-4 p-6 rounded-[2rem] border-2 transition-all text-left ${
                        answers[currentQ.id] === option 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${answers[currentQ.id] === option ? 'bg-primary text-slate-900' : 'bg-white shadow-md text-slate-500'}`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-lg font-medium">{option}</span>
                    </button>
                  ))}
                </div>
              )}

              {currentQ?.type === 'short_answer' && (
                <textarea
                  className="w-full bg-white border-2 border-slate-200 rounded-[2rem] p-8 text-xl text-slate-900 focus:border-primary outline-none transition-all placeholder:text-slate-700"
                  rows="6"
                  placeholder="Type your answer here..."
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                />
              )}

              {currentQ?.type === 'coding' && (
                <div className="h-[500px]">
                  <CodeIDE 
                    initialCode={answers[currentQ.id] || ''}
                    onCodeChange={handleAnswerChange}
                    language="javascript"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <footer className="h-24 bg-white border-t border-slate-200 flex items-center justify-between px-12">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors disabled:opacity-20"
          >
            <ChevronLeft className="w-6 h-6" /> Previous Question
          </button>

          <div className="flex items-center gap-3">
             {questions.map((_, i) => (
               <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${currentIndex === i ? 'w-6 bg-indigo-500' : 'bg-slate-700'}`} />
             ))}
          </div>

          <button
            disabled={currentIndex === questions.length - 1}
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="flex items-center gap-2 bg-white shadow-md hover:bg-slate-700 text-slate-900 px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-20"
          >
            Next Question <ChevronRight className="w-6 h-6" />
          </button>
        </footer>
      </main>
    </div>
  );
};

export default ExamAttempt;
