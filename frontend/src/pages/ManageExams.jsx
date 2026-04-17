import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, MoreVertical, Edit2, Trash2, Eye, Activity, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { quizService, adminService } from '../services/api';

const ManageExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await quizService.getAll();
      setExams(response.data);
    } catch (err) {
      console.error("Failed to fetch exams", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (e, id, title) => {
    e.stopPropagation();
    try {
      const response = await adminService.exportResults(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `results_${title.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handlePublish = async (id, title) => {
    if (!window.confirm(`Are you ready to publish "${title}"? This will lock the exam from further edits to ensure candidate data integrity.`)) {
      return;
    }
    try {
      await quizService.publish(id);
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.error || "Publishing failed");
    }
  };

  const handleDelete = async (id, title, status) => {
    // Deletion allowed for all statuses per user request.
    if (!window.confirm(`Are you absolutely sure you want to delete "${title}"? This will permanently remove all associated questions, attempts, and results.`)) {
      return;
    }

    try {
      await quizService.delete(id);
      fetchExams(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete exam");
    }
  };

  return (
    <div className="space-y-10">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Manage <span className="premium-gradient-text">Exams</span>
          </h1>
          <p className="text-slate-400 font-medium">Create, edit, and monitor your assessment catalog.</p>
        </motion.div>

        <button 
          onClick={() => navigate('/admin/exams/new')}
          className="btn-premium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Exam</span>
        </button>
      </section>

      <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
        <div className="px-10 py-6 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search exams..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
              />
           </div>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{exams.length} Total Exams</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] border-b border-white/5">
                <th className="px-10 py-6">Exam Title</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">Questions</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-10 py-20 text-center">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-10 py-6">
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{exam.title}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-widest">{exam.duration}m Duration</p>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                     <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase ${exam.status === 'published' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-500/10 border-slate-500/30 text-slate-400'}`}>
                        {exam.status}
                     </span>
                  </td>
                  <td className="px-10 py-6 text-slate-300 text-sm font-medium">{exam.question_count} Units</td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => navigate(`/exam/attempt/${exam.id}?preview=true`)}
                        className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        title="Preview Exam"
                       >
                        <Eye className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={(e) => handleExport(e, exam.id, exam.title)}
                        className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                        title="Export Results (CSV)"
                       >
                        <Download className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => navigate(`/admin/exams/${exam.id}/analytics`)}
                        className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                        title="View Analytics"
                       >
                        <Activity className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => navigate(`/admin/exams/${exam.id}/questions`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all group"
                        title="Manage Questions"
                       >
                        <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest px-1">Questions Hub</span>
                       </button>
                       
                       {exam.status !== 'published' ? (
                        <>
                          <button 
                            onClick={() => handlePublish(exam.id, exam.title)}
                            className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                            title="Publish Exam"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => navigate(`/admin/exams/${exam.id}/edit`)}
                            className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                            title="Edit Exam"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </>
                       ) : (
                         <div className="px-3 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-500 border border-white/5" title="Locked (Published)">
                            <span className="text-[8px] font-black uppercase tracking-widest">Locked</span>
                         </div>
                       )}

                       <button 
                        onClick={() => handleDelete(exam.id, exam.title, exam.status)}
                        className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                        title="Delete Exam"
                       >
                        <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && exams.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-10 py-20 text-center text-slate-500">
                    <p className="font-bold uppercase tracking-[0.2em] text-xs">No exams found in catalog</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageExams;
