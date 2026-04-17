import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../services/api';
import { 
  FileText, 
  Clock, 
  Percent, 
  Calendar, 
  ChevronLeft,
  Save,
  Rocket,
  AlertCircle,
  CheckCircle2,
  Code2,
  AlignLeft,
  Plus,
  Trash2,
  Eye,
  Settings2,
  Layers,
  Check,
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateExam = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // STEP 1: Quiz Metadata
  const [quizMeta, setQuizMeta] = useState({
    title: '',
    description: '',
    duration: 60,
    passing_percentage: 40,
    start_time: '',
    end_time: '',
  });

  // STEP 2 & 3: Question List & Current Question
  const [questions, setQuestions] = useState([]);
  const [activeType, setActiveType] = useState(null); // 'mcq', 'short_answer', 'coding'
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const resetCurrentQuestion = (type) => {
    setActiveType(type);
    if (type === 'mcq') {
      setCurrentQuestion({
        type: 'mcq',
        text: '',
        options: ['', ''],
        correct_answer: [], // For multiple correct, use array of strings/indices
        marks: 1,
        explanation: '',
        isMultiple: false
      });
    } else if (type === 'short_answer') {
      setCurrentQuestion({
        type: 'short_answer',
        text: '',
        correct_answer: '',
        marks: 1,
        explanation: ''
      });
    } else if (type === 'coding') {
      setCurrentQuestion({
        type: 'coding',
        text: '',
        test_cases: [{ input: '', output: '' }],
        marks: 5,
        explanation: ''
      });
    }
  };

  const handleAddQuestionToList = () => {
    console.log("Adding question to list:", currentQuestion);
    // Basic Validation
    if (!currentQuestion.text?.trim()) {
      setError('Question text is required');
      return;
    }

    if (currentQuestion.type === 'mcq') {
       if (currentQuestion.options.some(opt => !opt.trim())) {
         setError('All MCQ options must be filled');
         return;
       }
       if (!currentQuestion.correct_answer || currentQuestion.correct_answer.length === 0) {
         setError('Please select at least one correct answer');
         return;
       }
    } else if (currentQuestion.type === 'short_answer') {
       if (!currentQuestion.correct_answer?.trim()) {
         setError('Correct answer is required');
         return;
       }
    } else if (currentQuestion.type === 'coding') {
       if (currentQuestion.test_cases.some(tc => !tc.output.trim())) {
         setError('All test cases must have an expected output');
         return;
       }
    }

    const newQuestion = { 
      ...currentQuestion, 
      id: Date.now(),
      marks: parseInt(currentQuestion.marks) || 1
    };

    setQuestions(prev => [...prev, newQuestion]);
    setCurrentQuestion(null);
    setActiveType(null);
    setStep(4); // Go back to management list
    setError('');
  };

  const handleCreateFinal = async (status = 'published') => {
    if (questions.length === 0) {
      setError('Please add at least one question before publishing.');
      return;
    }
    setError('');
    setIsLoading(true);

    const payload = { 
      ...quizMeta, 
      duration: parseInt(quizMeta.duration) || 60,
      passing_percentage: parseInt(quizMeta.passing_percentage) || 40,
      status, 
      questions 
    };

    console.log("Publishing Payload:", payload);

    try {
      const response = await quizService.create(payload);
      console.log("Creation Response:", response.data);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error("Publishing Failed:", err);
      setError(err.response?.data?.error || 'Failed to create exam');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-12">
      {[1, 2, 3, 4, 5].map((i) => (
        <React.Fragment key={i}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-lg ${
            step === i ? 'bg-indigo-500 text-white scale-110' : 
            step > i ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
            'bg-white/5 text-slate-500 border border-white/10'
          }`}>
            {step > i ? <Check className="w-5 h-5" /> : i}
          </div>
          {i < 5 && <div className={`h-px w-12 ${step > i ? 'bg-emerald-500/20' : 'bg-white/5'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-40 px-4">
      {/* STICKY HEADER ACTIONS */}
      <div className="sticky top-0 z-[100] bg-slate-950/80 backdrop-blur-xl border-b border-white/5 -mx-4 px-4 py-4 mb-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs uppercase tracking-[0.2em] hidden sm:inline">Dashboard</span>
          </button>

          <div className="flex gap-4">
            {step > 1 && (
               <button 
                  onClick={() => setStep(step === 4 ? 2 : step - 1)}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 transition-all hover:bg-white/10 font-bold text-xs uppercase"
               >
                  Previous
               </button>
            )}
            {step === 5 && (
              <>
                <button 
                  onClick={() => handleCreateFinal('draft')}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-900 text-white px-6 py-3 rounded-xl border border-white/10 font-bold transition-all text-xs uppercase tracking-widest"
                >
                  <Save className="w-4 h-4 text-slate-500" /> Save Draft
                </button>
                <button 
                  onClick={() => handleCreateFinal('published')}
                  disabled={isLoading}
                  className="btn-premium flex items-center gap-2 px-8 py-3 text-xs text-white"
                >
                  <Rocket className="w-4 h-4" /> Publish Exam
                </button>
              </>
            )}
            {step < 5 && step !== 2 && step !== 3 && (
               <button 
                  onClick={() => {
                     if (step === 1 && !quizMeta.title) return setError('Title is required');
                     setError('');
                     setStep(step === 4 ? 5 : step + 1);
                  }}
                  className="btn-premium flex items-center gap-2 px-8 py-3 text-xs text-white"
               >
                  Next <ChevronRight className="w-4 h-4" />
               </button>
            )}
          </div>
        </div>
      </div>

      {renderStepIndicator()}

      <AnimatePresence mode="wait">
        {/* STEP 1: CORE DETAILS */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card rounded-[2.5rem] p-10 border-white/5 shadow-2xl overflow-hidden relative"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -mr-20 -mt-20" />
             <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Settings2 className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-3xl font-black text-white uppercase tracking-tight">General <span className="premium-gradient-text">Baseline</span></h2>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Configure the exam core settings</p>
                </div>
             </div>

            {error && <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center gap-3 text-sm font-bold"><AlertCircle className="w-4 h-4" /> {error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Assessment Title</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-lg font-bold placeholder:text-slate-700 focus:border-indigo-500/50 outline-none transition-all"
                    placeholder="e.g. Senior Frontend Engineer Certification"
                    value={quizMeta.title}
                    onChange={e => setQuizMeta({...quizMeta, title: e.target.value})}
                  />
               </div>
               <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Entry Instructions</label>
                  <textarea 
                    rows="4"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-medium placeholder:text-slate-700 focus:border-indigo-500/50 outline-none transition-all"
                    placeholder="Detail the expectations for this certification..."
                    value={quizMeta.description}
                    onChange={e => setQuizMeta({...quizMeta, description: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Time Window (Mins)</label>
                  <div className="relative">
                     <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                     <input 
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-black focus:border-indigo-500/50 outline-none"
                        value={quizMeta.duration}
                        onChange={e => setQuizMeta({...quizMeta, duration: parseInt(e.target.value)})}
                     />
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Success Threshold (%)</label>
                  <div className="relative">
                     <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                     <input 
                        type="number"
                        max="100"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-black focus:border-indigo-500/50 outline-none"
                        value={quizMeta.passing_percentage}
                        onChange={e => setQuizMeta({...quizMeta, passing_percentage: parseInt(e.target.value)})}
                     />
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Start Availability</label>
                  <input 
                    type="datetime-local"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold [color-scheme:dark]"
                    value={quizMeta.start_time}
                    onChange={e => setQuizMeta({...quizMeta, start_time: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Hard Deadline</label>
                  <input 
                    type="datetime-local"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold [color-scheme:dark]"
                    value={quizMeta.end_time}
                    onChange={e => setQuizMeta({...quizMeta, end_time: e.target.value})}
                  />
               </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: SELECT TYPE */}
        {step === 2 && (
           <motion.div 
             key="step2"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="grid grid-cols-1 md:grid-cols-3 gap-8"
           >
              {[
                { id: 'mcq', label: 'MCQ Assessment', icon: CheckCircle2, color: 'indigo', desc: 'Single or Multi-select questions with auto-grading.' },
                { id: 'short_answer', label: 'Theory / Short Answer', icon: AlignLeft, color: 'purple', desc: 'Auto-marking based on exact or case-insensitive matches.' },
                { id: 'coding', label: 'Coding Challenge', icon: Code2, color: 'amber', desc: 'Advanced code evaluation against hidden test cases.' },
              ].map(type => (
                <button
                   key={type.id}
                   onClick={() => { resetCurrentQuestion(type.id); setStep(3); }}
                   className="glass-card group p-10 rounded-[2.5rem] border-white/5 hover:border-indigo-500/30 transition-all text-left relative overflow-hidden"
                >
                   <div className={`w-14 h-14 rounded-2xl bg-${type.color}-500/10 border border-${type.color}-500/20 flex items-center justify-center text-${type.color}-400 mb-8 group-hover:scale-110 transition-transform`}>
                      <type.icon className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{type.label}</h3>
                   <p className="text-xs font-bold text-slate-500 leading-relaxed mb-8">{type.desc}</p>
                   <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      Configure Module <ChevronRight className="w-3 h-3" />
                   </div>
                </button>
              ))}
           </motion.div>
        )}

        {/* STEP 3: QUESTION BUILDER */}
        {step === 3 && currentQuestion && (
           <motion.div 
             key="step3"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="glass-card rounded-[2.5rem] p-10 border-white/5 relative"
           >
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                        {activeType === 'mcq' ? <CheckCircle2 className="w-5 h-5 text-indigo-400" /> : 
                         activeType === 'short_answer' ? <AlignLeft className="w-5 h-5 text-purple-400" /> : 
                         <Code2 className="w-5 h-5 text-amber-400" />}
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-widest">Building {activeType.replace('_', ' ')} Module</span>
                 </div>
                 <button onClick={() => { setActiveType(null); setStep(2); }} className="text-[10px] font-black text-slate-500 uppercase hover:text-white transition-colors">Change Type</button>
              </div>

              {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold">{error}</div>}

              <div className="space-y-8">
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Question Text</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-bold placeholder:text-slate-700 focus:border-indigo-500/50 outline-none"
                      rows="3"
                      placeholder="Enter the question clearly..."
                      value={currentQuestion.text}
                      onChange={e => setCurrentQuestion({...currentQuestion, text: e.target.value})}
                    />
                 </div>

                 {activeType === 'mcq' && (
                    <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Answer Options</label>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-slate-500 uppercase">Multi-select:</span>
                             <button 
                                onClick={() => setCurrentQuestion({...currentQuestion, isMultiple: !currentQuestion.isMultiple, correct_answer: []})}
                                className={`w-10 h-5 rounded-full relative transition-all ${currentQuestion.isMultiple ? 'bg-indigo-500' : 'bg-slate-800'}`}
                             >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${currentQuestion.isMultiple ? 'left-6' : 'left-1'}`} />
                             </button>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentQuestion.options.map((opt, idx) => (
                             <div key={idx} className="flex gap-3 items-center group">
                                <button 
                                  onClick={() => {
                                    const isSet = currentQuestion.correct_answer.includes(opt);
                                    let newCorrect;
                                    if (currentQuestion.isMultiple) {
                                      newCorrect = isSet ? currentQuestion.correct_answer.filter(a => a !== opt) : [...currentQuestion.correct_answer, opt];
                                    } else {
                                      newCorrect = [opt];
                                    }
                                    setCurrentQuestion({...currentQuestion, correct_answer: newCorrect});
                                  }}
                                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                                    currentQuestion.correct_answer.includes(opt) && opt !== ''
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                                    : 'bg-white/5 border-white/5 text-slate-500'
                                  }`}
                                >
                                   <Check className={`w-4 h-4 ${currentQuestion.correct_answer.includes(opt) && opt !== '' ? 'opacity-100' : 'opacity-20'}`} />
                                </button>
                                <div className="flex-1 relative">
                                   <input 
                                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-5 text-sm font-bold text-white focus:border-indigo-500/30 outline-none"
                                      value={opt}
                                      onChange={e => {
                                         const newOpts = [...currentQuestion.options];
                                         const oldVal = newOpts[idx];
                                         newOpts[idx] = e.target.value;
                                         // Update correct answer if this value was selected
                                         let newCorrect = currentQuestion.correct_answer;
                                         if (newCorrect.includes(oldVal)) {
                                            newCorrect = newCorrect.map(c => c === oldVal ? e.target.value : c);
                                         }
                                         setCurrentQuestion({...currentQuestion, options: newOpts, correct_answer: newCorrect});
                                      }}
                                      placeholder={`Option ${idx + 1}`}
                                   />
                                   {currentQuestion.options.length > 2 && (
                                      <button 
                                        onClick={() => {
                                           const newOpts = currentQuestion.options.filter((_, i) => i !== idx);
                                           const newCorrect = currentQuestion.correct_answer.filter(c => c !== opt);
                                           setCurrentQuestion({...currentQuestion, options: newOpts, correct_answer: newCorrect});
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-500 transition-all"
                                      >
                                         <X className="w-3 h-3" />
                                      </button>
                                   )}
                                </div>
                             </div>
                          ))}
                          <button 
                             onClick={() => setCurrentQuestion({...currentQuestion, options: [...currentQuestion.options, '']})}
                             className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest p-4 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10"
                          >
                             <Plus className="w-3 h-3" /> Add Option
                          </button>
                       </div>
                    </div>
                 )}

                 {activeType === 'short_answer' && (
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Master Answer (Case-Insensitive)</label>
                        <input 
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold focus:border-indigo-500/50 outline-none"
                           placeholder="Type the exact single answer or phrase..."
                           value={currentQuestion.correct_answer}
                           onChange={e => setCurrentQuestion({...currentQuestion, correct_answer: e.target.value})}
                        />
                    </div>
                 )}

                 {activeType === 'coding' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                           <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Test Cases & Expected Hub</label>
                           <button 
                             onClick={() => setCurrentQuestion({...currentQuestion, test_cases: [...currentQuestion.test_cases, { input: '', output: '' }]})}
                             className="text-[10px] font-black text-indigo-400 uppercase flex items-center gap-2"
                           >
                              <Plus className="w-3 h-3" /> Add Case
                           </button>
                        </div>
                        <div className="space-y-4">
                           {currentQuestion.test_cases.map((tc, idx) => (
                              <div key={idx} className="flex flex-col md:flex-row gap-4 p-5 bg-white/5 border border-white/5 rounded-2xl relative group">
                                 <div className="flex-1">
                                    <label className="block text-[8px] font-black text-slate-600 mb-2 uppercase">Input</label>
                                    <textarea 
                                       className="w-full bg-slate-900/50 border border-white/5 rounded-xl p-3 text-[11px] font-mono text-white outline-none"
                                       rows="2"
                                       value={tc.input}
                                       onChange={e => {
                                          const newTC = [...currentQuestion.test_cases];
                                          newTC[idx].input = e.target.value;
                                          setCurrentQuestion({...currentQuestion, test_cases: newTC});
                                       }}
                                    />
                                 </div>
                                 <div className="flex-1">
                                    <label className="block text-[8px] font-black text-emerald-500/50 mb-2 uppercase">Expected Output</label>
                                    <textarea 
                                       className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-[11px] font-mono text-emerald-400 outline-none"
                                       rows="2"
                                       value={tc.output}
                                       onChange={e => {
                                          const newTC = [...currentQuestion.test_cases];
                                          newTC[idx].output = e.target.value;
                                          setCurrentQuestion({...currentQuestion, test_cases: newTC});
                                       }}
                                    />
                                 </div>
                                 {currentQuestion.test_cases.length > 1 && (
                                    <button 
                                       onClick={() => {
                                          const newTC = currentQuestion.test_cases.filter((_, i) => i !== idx);
                                          setCurrentQuestion({...currentQuestion, test_cases: newTC});
                                       }}
                                       className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-all shadow-lg"
                                    >
                                       <Trash2 className="w-3 h-3" />
                                    </button>
                                 )}
                              </div>
                           ))}
                        </div>
                    </div>
                 )}

                 <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row gap-8">
                    <div className="w-48">
                        <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Marks</label>
                        <input 
                           type="number"
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-black focus:border-indigo-500/50 outline-none"
                           value={currentQuestion.marks}
                           onChange={e => setCurrentQuestion({...currentQuestion, marks: parseInt(e.target.value)})}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Explanation (Shown after exam)</label>
                        <input 
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-medium focus:border-indigo-500/50 outline-none"
                           placeholder="Why is this the correct answer?"
                           value={currentQuestion.explanation}
                           onChange={e => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                        />
                    </div>
                 </div>

                 <button 
                   onClick={handleAddQuestionToList}
                   className="w-full btn-premium py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] shadow-2xl"
                 >
                    Confirm Question
                 </button>
              </div>
           </motion.div>
        )}

        {/* STEP 4: REVIEW LIST */}
        {step === 4 && (
           <motion.div 
             key="step4"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-8"
           >
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-black text-white uppercase tracking-tight">Question <span className="premium-gradient-text">Inventory</span></h2>
                 <button 
                   onClick={() => setStep(2)}
                   className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-dashed border-indigo-500/30 text-indigo-400 font-bold text-xs uppercase hover:bg-indigo-500/5 transition-all"
                 >
                    <Plus className="w-4 h-4" /> Add Module
                 </button>
              </div>

              {questions.length === 0 ? (
                 <div className="glass-card p-20 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6">
                       <Layers className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">No Questions Added</h3>
                    <p className="text-slate-500 text-sm max-w-xs font-medium">Start building your assessment by selecting a module type above.</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                   {questions.map((q, idx) => (
                      <div key={q.id} className="glass-card group p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-6">
                         <div className="flex items-center gap-6 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-indigo-500 transition-all group-hover:text-white">
                               {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                                     q.type === 'mcq' ? 'bg-indigo-500/10 text-indigo-400' : 
                                     q.type === 'short_answer' ? 'bg-purple-500/10 text-purple-400' : 'bg-amber-500/10 text-amber-400'
                                  }`}>{q.type.replace('_', ' ')}</span>
                                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{q.marks} Marks</span>
                               </div>
                               <p className="text-sm font-bold text-white truncate">{q.text}</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                             <button 
                                onClick={() => {
                                   setCurrentQuestion(q);
                                   setActiveType(q.type);
                                   setQuestions(questions.filter(item => item.id !== q.id));
                                   setStep(3);
                                }}
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"
                             >
                                <Settings2 className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => setQuestions(questions.filter(item => item.id !== q.id))}
                                className="w-10 h-10 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                         </div>
                      </div>
                   ))}
                </div>
              )}
           </motion.div>
        )}

        {/* STEP 5: FINAL PREVIEW */}
        {step === 5 && (
           <motion.div 
              key="step5"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto"
           >
              <div className="text-center mb-12">
                 <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Certification <span className="premium-gradient-text">Mastery</span></h2>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Confirm your setup before deployment</p>
              </div>

              <div className="glass-card rounded-[3rem] p-10 border-white/5 shadow-2xl space-y-10">
                 <section className="pb-10 border-b border-white/5">
                    <div className="flex justify-between items-start mb-6">
                       <h3 className="text-3xl font-black text-white">{quizMeta.title}</h3>
                       <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                          {quizMeta.duration} Mins
                       </div>
                    </div>
                    <p className="text-slate-400 font-medium leading-relaxed">{quizMeta.description}</p>
                 </section>

                 <section className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Examination Content</h4>
                    <div className="space-y-6">
                       {questions.map((q, i) => (
                          <div key={i} className="flex gap-6 p-6 rounded-2xl bg-white/5 border border-white/5">
                             <span className="text-xs font-black text-slate-700">{i + 1}</span>
                             <div>
                                <p className="text-sm font-bold text-white mb-4">{q.text}</p>
                                {q.type === 'mcq' && (
                                   <div className="grid grid-cols-2 gap-3">
                                      {q.options.map((opt, oi) => (
                                         <div key={oi} className={`px-4 py-2 rounded-xl text-[10px] font-bold border ${
                                            q.correct_answer.includes(opt) ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800/50 border-white/5 text-slate-500'
                                         }`}>
                                            {opt}
                                         </div>
                                      ))}
                                   </div>
                                )}
                                {q.type === 'coding' && (
                                   <div className="p-4 bg-slate-900 rounded-xl border border-white/5 font-mono text-[10px] text-slate-400">
                                      // Coding Module Loaded ({q.test_cases.length} Test Cases)
                                   </div>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>
                 </section>

                 <div className="flex gap-4 p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                       <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-xs font-black text-white uppercase tracking-tight">Configuration Synchronized</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Passing percentage locked at {quizMeta.passing_percentage}%</p>
                    </div>
                 </div>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateExam;
