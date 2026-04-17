import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionService, quizService } from '../services/api';
import { 
  Plus, 
  Upload, 
  FileSpreadsheet, 
  Trash2, 
  CheckCircle2, 
  Code2, 
  AlignLeft,
  ChevronLeft,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManageQuestions = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [qType, setQType] = useState('mcq');
  
  // Form State
  const [uploadReport, setUploadReport] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    marks: 1,
    explanation: '',
    codingLanguage: 'javascript',
    testCases: [{ input: '', output: '' }]
  });

  useEffect(() => {
    fetchData();
  }, [quizId]);

  const resetForm = (newType = 'mcq') => {
    setQType(newType);
    setFormData({
      text: '',
      options: ['', '', '', ''],
      correct_answer: '',
      marks: 1,
      explanation: '',
      codingLanguage: 'javascript',
      testCases: [{ input: '', output: '' }]
    });
  };

  const fetchData = async () => {
    try {
      const [quizRes, qRes] = await Promise.all([
        quizService.getById(quizId),
        questionService.getByQuiz(quizId)
      ]);
      setQuiz(quizRes.data);
      setQuestions(qRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e, stayOpen = false) => {
    if (e) e.preventDefault();
    // Lock removed per user request: Allow adding questions even if published
    try {
      let payloadOptions = null;
      if (qType === 'mcq') {
        payloadOptions = formData.options;
      } else if (qType === 'coding') {
        payloadOptions = {
          language: formData.codingLanguage,
          testCases: formData.testCases.filter(tc => tc.input || tc.output)
        };
      }

      await questionService.addManual({ 
        ...formData, 
        quiz_id: quizId, 
        type: qType,
        options: payloadOptions
      });
      
      if (!stayOpen) {
        setShowAddModal(false);
        resetForm();
      } else {
        // Just reset data, stay on same type for rapid creation
        setFormData(prev => ({
          ...prev, text: '', options: ['', '', '', ''], correct_answer: '', testCases: [{ input: '', output: '' }]
        }));
      }
      fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to add question. Please check all fields.";
      alert(errorMsg);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Lock removed per user request
    const fd = new FormData();
    fd.append('file', file);
    fd.append('quiz_id', quizId);

    try {
      setLoading(true);
      const response = await questionService.uploadExcel(fd);
      setUploadReport(response.data.summary);
      fetchData();
    } catch (err) {
      alert("File upload failed. Ensure correct Excel format.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await questionService.getTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Exam_Question_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Template download failed", err);
    }
  };

  const handleDelete = async (qId) => {
    // Lock removed per user request
    if (!window.confirm("Delete this question?")) return;
    try {
      await questionService.delete(qId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

      const handleDeleteExam = async () => {
        if (!window.confirm(`Are you absolutely sure you want to PERMANENTLY delete "${quiz?.title}"? This will return you to the dashboard and remove all content.`)) return;
        try {
          await quizService.delete(quizId);
          navigate('/admin/dashboard');
        } catch (err) {
          alert("Delete failed");
        }
      };

      return (
        <div className="max-w-6xl mx-auto pb-20 px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors group">
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                   <h1 className="text-2xl font-black uppercase tracking-tight">{quiz?.title}</h1>
                   <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase ${quiz?.status === 'published' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'}`}>
                      {quiz?.status}
                   </span>
                </div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Evaluation Component Builder</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleDeleteExam}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                <Trash2 className="w-4 h-4" /> Delete Exam
              </button>
              <button 
                onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Template
          </button>
          <input 
            type="file" 
            id="excel-upload" 
            hidden 
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => document.getElementById('excel-upload').click()}
            className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-5 py-2.5 rounded-xl border border-indigo-500/20 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" /> Bulk Upload
          </button>
          <button 
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-slate-800 border border-slate-700/50 p-6 rounded-2xl flex items-start justify-between group">
            <div className="flex gap-6">
              <div className="text-slate-600 font-bold text-lg pt-1">#{i + 1}</div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                    q.type === 'mcq' ? 'bg-blue-500/10 text-blue-400' : 
                    q.type === 'coding' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {q.type}
                  </span>
                  <span className="text-slate-500 text-xs font-medium">{q.marks} Marks</span>
                </div>
                <h3 className="text-lg font-medium text-slate-100">{q.text}</h3>
                {q.type === 'mcq' && q.options && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {q.options.map((opt, idx) => {
                      let isCorrect = false;
                      try {
                        const parsedCorrect = JSON.parse(q.correct_answer);
                        isCorrect = Array.isArray(parsedCorrect) ? parsedCorrect.includes(opt) : opt === q.correct_answer;
                      } catch (e) {
                        isCorrect = opt === q.correct_answer;
                      }
                      
                      return (
                        <div key={idx} className={`text-sm py-2 px-3 rounded-lg border ${isCorrect ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400' : 'border-slate-700 text-slate-400'}`}>
                           {opt}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => handleDelete(q.id)}
              className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-red-500/10"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        {questions.length === 0 && (
          <div className="text-center py-20 bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-700">
            <FileSpreadsheet className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-500">No questions yet</h3>
            <p className="text-slate-600 mt-1 max-w-xs mx-auto">Start building your quiz by adding questions manually or uploading an Excel file.</p>
          </div>
        )}
      </div>

      {/* Manual Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">Add Question</h3>
                </div>
                <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }}><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              <form onSubmit={handleManualSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">Question Type</label>
                  <select 
                    value={qType}
                    onChange={(e) => resetForm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="coding">Coding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">
                    {qType === 'coding' ? 'Problem Description' : 'Question Text'}
                  </label>
                  <textarea 
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    rows="3"
                    placeholder="Write your question here..."
                    value={formData.text}
                    onChange={(e) => setFormData({...formData, text: e.target.value})}
                  />
                </div>

                    {qType === 'mcq' && (
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-400 uppercase tracking-wide">Options & Correct Answer</label>
                        {formData.options.map((opt, i) => (
                          <div key={i} className="flex gap-3">
                            <input 
                              type="text" 
                              required
                              placeholder={`Option ${i+1}`}
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...formData.options];
                                newOpts[i] = e.target.value;
                                setFormData({...formData, options: newOpts});
                              }}
                            />
                            <button 
                              type="button"
                              onClick={() => setFormData({...formData, correct_answer: opt})}
                              className={`px-4 rounded-xl border transition-all ${formData.correct_answer === opt && opt !== '' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-700 text-slate-500'}`}
                              title="Set as correct answer"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {qType === 'short_answer' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">Expected / Correct Answer</label>
                        <textarea 
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white active:ring-2 focus:ring-indigo-500 outline-none"
                          rows="2"
                          placeholder="Provide the expected text-based answer..."
                          value={formData.correct_answer}
                          onChange={(e) => setFormData({...formData, correct_answer: e.target.value})}
                        />
                      </div>
                    )}

                    {qType === 'coding' && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">Language Context</label>
                          <select 
                            value={formData.codingLanguage}
                            onChange={(e) => setFormData({...formData, codingLanguage: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="javascript">JavaScript (Node.js)</option>
                            <option value="python">Python 3</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">Boilerplate / Starter Code</label>
                          <textarea 
                            className="w-full bg-[#1e1e1e] font-mono border border-slate-700 rounded-xl p-4 text-slate-300 active:ring-2 focus:ring-indigo-500 outline-none"
                            rows="5"
                            placeholder={"function solution(input) {\n  // Code here\n}"}
                            value={formData.correct_answer}
                            onChange={(e) => setFormData({...formData, correct_answer: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide flex items-center justify-between">
                            <span>Test Cases (Optional)</span>
                            <button 
                              type="button" 
                              onClick={() => setFormData({...formData, testCases: [...formData.testCases, { input: '', output: '' }]})}
                              className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Test Case
                            </button>
                          </label>
                          <div className="space-y-3">
                            {formData.testCases.map((tc, idx) => (
                              <div key={idx} className="flex gap-3 bg-slate-900 border border-slate-700 p-3 rounded-xl items-start">
                                <div className="flex-1 space-y-2">
                                  <input 
                                    type="text" 
                                    placeholder={`Input ${idx+1}`}
                                    className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-white"
                                    value={tc.input}
                                    onChange={e => {
                                      const tcCopy = [...formData.testCases];
                                      tcCopy[idx].input = e.target.value;
                                      setFormData({...formData, testCases: tcCopy});
                                    }}
                                  />
                                  <input 
                                    type="text" 
                                    placeholder={`Expected Output ${idx+1}`}
                                    className="w-full bg-slate-800 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-white"
                                    value={tc.output}
                                    onChange={e => {
                                      const tcCopy = [...formData.testCases];
                                      tcCopy[idx].output = e.target.value;
                                      setFormData({...formData, testCases: tcCopy});
                                    }}
                                  />
                                </div>
                                {formData.testCases.length > 1 && (
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const tcCopy = formData.testCases.filter((_, i) => i !== idx);
                                      setFormData({...formData, testCases: tcCopy});
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-red-400 opacity-50 hover:opacity-100 transition-all rounded-lg"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">Weight (Marks)</label>
                        <input 
                          type="number" 
                          min="1"
                          required
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                          value={formData.marks}
                          onChange={(e) => setFormData({...formData, marks: parseInt(e.target.value) || 1})}
                        />
                      </div>
                    </div>
              </form>
              <div className="p-6 bg-slate-800 border-t border-slate-700 flex justify-end gap-4">
                <button 
                  onClick={() => handleManualSubmit(null, true)}
                  disabled={
                    (qType === 'mcq' && (!formData.correct_answer || formData.options.some(o => !o))) ||
                    (qType === 'short_answer' && !formData.correct_answer) ||
                    (qType === 'coding' && !formData.text)
                  }
                  className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/10 disabled:opacity-50"
                >
                  Save & Add Another
                </button>
                <button 
                  onClick={handleManualSubmit}
                  disabled={
                    (qType === 'mcq' && (!formData.correct_answer || formData.options.some(o => !o))) ||
                    (qType === 'short_answer' && !formData.correct_answer) ||
                    (qType === 'coding' && !formData.text)
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  Save Question
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Report Modal */}
      <AnimatePresence>
        {uploadReport && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
               <div className="p-8 border-b border-white/5 bg-white/5">
                  <div className="flex items-center gap-4 mb-2">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                        <Upload className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Processing Result</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Bulk Question Ingestion Service</p>
                     </div>
                  </div>
               </div>
               
               <div className="p-10 space-y-8">
                  <div className="grid grid-cols-3 gap-6">
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Rows</p>
                        <p className="text-2xl font-black text-white">{uploadReport.total}</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Success</p>
                        <p className="text-2xl font-black text-emerald-400">{uploadReport.success}</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Failed</p>
                        <p className="text-2xl font-black text-red-100">{uploadReport.failed}</p>
                     </div>
                  </div>

                  {uploadReport.errors.length > 0 && (
                     <div className="space-y-3">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                           Critical Validation Failures <X className="w-3 h-3" />
                        </p>
                        <div className="max-h-48 overflow-y-auto pr-4 space-y-2 custom-scrollbar">
                           {uploadReport.errors.map((err, idx) => (
                              <div key={idx} className="flex gap-4 p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-xs">
                                 <span className="font-black text-red-400 underline decoration-red-400/30">Row {err.row}</span>
                                 <span className="text-slate-400 font-medium">{err.error}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>

               <div className="p-8 bg-white/5 border-t border-white/5 flex justify-end">
                  <button 
                    onClick={() => setUploadReport(null)}
                    className="btn-premium px-10 py-3 text-xs"
                  >
                    Got It
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageQuestions;
