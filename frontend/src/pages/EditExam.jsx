import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const EditExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    passing_percentage: 40,
    start_time: '',
    end_time: '',
    status: 'draft'
  });
  
  const [selectedModules, setSelectedModules] = useState(['mcq']);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      const response = await quizService.getById(id);
      const data = response.data;
      
      // Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm)
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().slice(0, 16);
      };

      setFormData({
        title: data.title || '',
        description: data.description || '',
        duration: data.duration || 60,
        passing_percentage: data.passing_percentage || 40,
        start_time: formatDate(data.start_time),
        end_time: formatDate(data.end_time),
        status: data.status || 'draft'
      });
    } catch (err) {
      console.error("Failed to fetch exam", err);
      setError("Failed to load exam details.");
    } finally {
      setIsFetching(false);
    }
  };

  const toggleModule = (id) => {
    setSelectedModules(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(m => m !== id) : prev) 
        : [...prev, id]
    );
  };

  const handleSubmit = async (e, finalStatus) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const statusToApply = finalStatus || formData.status;
      await quizService.update(id, { ...formData, status: statusToApply });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update exam');
    } finally {
      setIsLoading(false);
    }
  };

  const modules = [
    { id: 'mcq', label: 'MCQ Assessment', icon: CheckCircle2, desc: 'Multiple choice questions with auto-grading.' },
    { id: 'coding', label: 'Coding Challenge', icon: Code2, desc: 'Real-time code execution and test case evaluation.' },
    { id: 'short_answer', label: 'Short Answer', icon: AlignLeft, desc: 'Descriptive or theory-based written responses.' }
  ];

  if (isFetching) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-indigo-500 opacity-50" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Exam Core...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm uppercase tracking-widest">Back to Dash</span>
        </button>
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 font-bold transition-all ${
              formData.status === 'draft' ? 'bg-indigo-600/20 border-indigo-500/50 text-white' : 'bg-slate-950/50 hover:bg-slate-900 text-white'
            }`}
          >
            <Save className={`w-4 h-4 ${formData.status === 'draft' ? 'text-indigo-400' : 'text-slate-500'}`} /> 
            <span className="text-xs uppercase tracking-widest">Update Draft</span>
          </button>
          <button 
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={isLoading}
            className={`btn-premium flex items-center gap-2 px-8 py-3 text-xs text-white ${
              formData.status === 'published' ? 'ring-2 ring-indigo-500/50' : ''
            }`}
          >
            <Rocket className="w-4 h-4" /> 
            <span>{formData.status === 'published' ? 'Update & Keep Published' : 'Publish Exam'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[2.5rem] p-10 border-white/5 shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black text-white">Edit <span className="premium-gradient-text">Configuration</span></h2>
                </div>

                {error && (
                <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" /> {error}
                </div>
                )}

                <form className="space-y-8">
                    <div className="grid grid-cols-1 gap-8">
                        <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">Exam Identity</label>
                        <input 
                            type="text" 
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                            placeholder="e.g. Senior Backend Engineer - Node.js"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                        </div>

                        <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">Assessment Instructions</label>
                        <textarea 
                            rows="4"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                            placeholder="Detail the rules and expectations for this exam..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">Time Limit (Mins)</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input 
                                        type="number" 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 text-white focus:border-indigo-500/50 outline-none transition-all font-bold"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">Success Threshold (%)</label>
                                <div className="relative">
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input 
                                        type="number" 
                                        max="100"
                                        min="1"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 text-white focus:border-indigo-500/50 outline-none transition-all font-bold"
                                        value={formData.passing_percentage}
                                        onChange={(e) => setFormData({...formData, passing_percentage: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">Available From</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input 
                                        type="datetime-local" 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 text-white focus:border-indigo-500/50 outline-none transition-all [color-scheme:dark] font-bold"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">Expires At</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input 
                                        type="datetime-local" 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 text-white focus:border-indigo-500/50 outline-none transition-all [color-scheme:dark] font-bold"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>

        <div className="space-y-8">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card rounded-[2.5rem] p-10 border-white/5"
            >
                <h3 className="text-xl font-bold text-white mb-8 border-b border-white/5 pb-4">Exam <span className="text-indigo-400">Modules</span></h3>
                <div className="space-y-4">
                    {modules.map(module => (
                        <button
                            key={module.id}
                            type="button"
                            onClick={() => toggleModule(module.id)}
                            className={`w-full text-left p-6 rounded-[1.5rem] border-2 transition-all group ${
                                selectedModules.includes(module.id) 
                                ? 'bg-indigo-500/10 border-indigo-500 text-white' 
                                : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedModules.includes(module.id) ? 'bg-indigo-500 text-white' : 'bg-slate-800'}`}>
                                    <module.icon className="w-5 h-5" />
                                </div>
                                <span className={`font-black text-xs uppercase tracking-widest ${selectedModules.includes(module.id) ? 'text-indigo-400' : ''}`}>{module.label}</span>
                            </div>
                            <p className="text-[10px] font-bold leading-relaxed ml-14 opacity-60">{module.desc}</p>
                        </button>
                    ))}
                </div>
            </motion.div>

            <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem]">
                <p className="text-[10px] font-bold text-slate-500 leading-relaxed text-center px-4">
                    You can add specific questions for these modules after creating the exam baseline.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditExam;

