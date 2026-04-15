import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../services/api';
import { 
  FileText, 
  MapPin, 
  Clock, 
  Percent, 
  Calendar, 
  ChevronLeft,
  Save,
  Rocket,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const CreateExam = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    passing_percentage: 40,
    start_time: '',
    end_time: '',
    status: 'draft'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e, finalStatus = 'draft') => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await quizService.create({ ...formData, status: finalStatus });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create exam');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Dashboard
        </button>
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={isLoading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl border border-slate-700 font-bold transition-all"
          >
            <Save className="w-5 h-5" /> Save as Draft
          </button>
          <button 
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={isLoading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Rocket className="w-5 h-5" /> Publish Exam
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 border border-slate-700/50 rounded-3xl p-8 shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-8">Exam Configuration</h2>

        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        <form className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Exam Title</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 px-12 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                  placeholder="e.g. Advanced Data Structures Quiz"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Description</label>
              <textarea 
                rows="4"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="Describe what this exam covers..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Duration (Minutes)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="number" 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 px-12 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  />
                </div>
              </div>

              {/* Passing % */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Passing Percentage</label>
                <div className="relative">
                  <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="number" 
                    max="100"
                    min="1"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 px-12 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.passing_percentage}
                    onChange={(e) => setFormData({...formData, passing_percentage: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-700">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Start Time</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="datetime-local" 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 px-12 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all [color-scheme:dark]"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">End Time</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="datetime-local" 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 px-12 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all [color-scheme:dark]"
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
  );
};

export default CreateExam;
