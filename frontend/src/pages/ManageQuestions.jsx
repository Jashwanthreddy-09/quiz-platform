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
  const [formData, setFormData] = useState({
    text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    marks: 1,
    explanation: ''
  });

  useEffect(() => {
    fetchData();
  }, [quizId]);

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

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await questionService.addManual({ 
        ...formData, 
        quiz_id: quizId, 
        type: qType 
      });
      setShowAddModal(false);
      fetchData();
      setFormData({ text: '', options: ['', '', '', ''], correct_answer: '', marks: 1, explanation: '' });
    } catch (err) {
      alert("Failed to add question");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);
    fd.append('quiz_id', quizId);

    try {
      setLoading(true);
      await questionService.uploadExcel(fd);
      fetchData();
    } catch (err) {
      alert("File upload failed. Ensure correct Excel format.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{quiz?.title}</h1>
            <p className="text-slate-400 text-sm">Manage questions for this exam</p>
          </div>
        </div>
        <div className="flex gap-4">
          <input 
            type="file" 
            id="excel-upload" 
            hidden 
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => document.getElementById('excel-upload').click()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl border border-slate-700 font-bold transition-all"
          >
            <Upload className="w-5 h-5" /> Bulk Upload
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-5 h-5" /> Add Question
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
                    {q.options.map((opt, idx) => (
                      <div key={idx} className={`text-sm py-2 px-3 rounded-lg border ${opt === q.correct_answer ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400' : 'border-slate-700 text-slate-400'}`}>
                         {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
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
                <h3 className="text-xl font-bold">Add Question</h3>
                <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              <form onSubmit={handleManualSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">Question Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'mcq', label: 'MCQ', icon: CheckCircle2 },
                      { id: 'short_answer', label: 'Short', icon: AlignLeft },
                      { id: 'coding', label: 'Coding', icon: Code2 }
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setQType(type.id)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${qType === type.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-700 text-slate-400'}`}
                      >
                        <type.icon className="w-4 h-4" /> {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">Question Text</label>
                  <textarea 
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    rows="3"
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
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {qType !== 'mcq' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">Sample/Correct Answer</label>
                    <textarea 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white active:ring-2 focus:ring-indigo-500"
                      rows="2"
                      value={formData.correct_answer}
                      onChange={(e) => setFormData({...formData, correct_answer: e.target.value})}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">Weight (Marks)</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
                      value={formData.marks}
                      onChange={(e) => setFormData({...formData, marks: e.target.value})}
                    />
                  </div>
                </div>
              </form>
              <div className="p-6 bg-slate-800 border-t border-slate-700 flex justify-end">
                <button 
                  onClick={handleManualSubmit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
                >
                  Save Question
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
