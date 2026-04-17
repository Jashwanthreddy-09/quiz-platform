import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  ArrowLeft, Download, Printer, Users, Target, CheckCircle2, TrendingUp, Trophy, ChevronLeft, FileText, Activity, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [difficultQuestions, setDifficultQuestions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, difficultRes] = await Promise.all([
          adminService.getAnalytics(id),
          adminService.getDifficultQuestions(id)
        ]);
        setData(analyticsRes.data);
        setDifficultQuestions(difficultRes.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleExportCSV = () => {
    if (!data || !data.roster) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Student Name,Email,Score (%),Time Taken (s),Completed At\n";
    data.roster.forEach(row => {
      const date = new Date(row.completed_at).toLocaleString().replace(/,/g, '');
      csvContent += `"${row.student_name}","${row.student_email}",${row.score},${row.time_taken},"${date}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Analytics_${data.quizTitle.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = async (userId) => {
    if (!window.confirm("Are you sure you want to reset this student's attempt? They will be allowed to retake the exam from scratch.")) return;
    try {
      await adminService.resetAttempt(userId, id);
      const [analyticsRes] = await Promise.all([
        adminService.getAnalytics(id)
      ]);
      setData(analyticsRes.data);
      alert("Attempt reset successfully.");
    } catch (err) {
      alert("Failed to reset attempt.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Processing Report...</p>
    </div>
  );
  if (!data) return <div className="text-white p-10 text-center glass-card rounded-2xl">Analytics not available.</div>;

  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

  return (
    <div className="space-y-10 print:bg-white print:p-8 print:text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                 <ChevronLeft className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm uppercase tracking-widest">Dash</span>
           </button>
           <div className="h-10 w-px bg-white/10" />
           <div>
              <h1 className="text-2xl font-black text-white">{data.quizTitle}</h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Active Report Console</p>
              </div>
           </div>
        </div>
        <div className="flex gap-4">
          <button onClick={handlePrint} className="px-5 py-2.5 rounded-xl border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2">
            <Printer className="w-4 h-4 text-slate-400" /> Export PDF
          </button>
          <button onClick={handleExportCSV} className="btn-premium px-6 py-2.5 text-xs text-white flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Raw Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Attempts', value: data.summary.totalAttempts, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Average Score', value: `${data.summary.averageScore}%`, icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Highest Score', value: `${data.summary.highestScore}%`, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Pass Rate', value: `${data.summary.passRate}%`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group"
          >
            <div className="absolute -right-2 -top-2 w-16 h-16 bg-white/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} border border-white/5`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <span className="text-3xl font-black text-white">{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Row 2: Distribution & Difficult Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass-card p-10 rounded-[2.5rem]">
          <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-10">
            <Activity className="w-5 h-5 text-indigo-400" /> Score Distribution
          </h3>
          <div className="h-80 w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.distribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f172a', color: '#fff' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {data.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem]">
           <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-10">
              <TrendingUp className="w-5 h-5 text-purple-400" /> Critical Questions
           </h3>
           <div className="space-y-6">
              {difficultQuestions.length > 0 ? difficultQuestions.map((q, i) => (
                <div key={i} className="group p-5 bg-white/5 border border-white/5 rounded-3xl hover:border-red-500/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                     <span className="text-[10px] font-black text-red-100 bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">FAIL RATE {Math.round((q.incorrect_count / q.total_attempts) * 100)}%</span>
                     <span className="text-[10px] font-bold text-slate-500 uppercase">{q.type}</span>
                  </div>
                  <p className="text-xs font-bold text-white leading-relaxed line-clamp-2">{q.text}</p>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-30 py-10">
                   <Target className="w-10 h-10 mb-4" />
                   <p className="font-bold uppercase tracking-widest text-[10px]">No anomalies detected</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
        <div className="px-10 py-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400">Detailed Student Roster</h3>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{data.roster.length} Total Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] border-b border-white/5">
                <th className="px-10 py-6">Student</th>
                <th className="px-10 py-6">Performance</th>
                <th className="px-10 py-6">Timeline</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.roster.map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-all group">
                  <td className="px-10 py-6">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border border-white/10 p-0.5">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.student_name}`} className="w-full h-full rounded-full bg-slate-800" alt="avatar" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{row.student_name}</p>
                           <p className="text-[10px] text-slate-500 font-medium">{row.student_email}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-6">
                     <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center w-32">
                           <span className="text-[10px] font-black text-slate-500">SCORE</span>
                           <span className={`text-xs font-black ${row.score >= (data.quizPassingPercentage || 40) ? 'text-emerald-400' : 'text-red-400'}`}>{row.score}%</span>
                        </div>
                        <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full ${row.score >= (data.quizPassingPercentage || 40) ? 'bg-emerald-400' : 'bg-red-400'}`} style={{ width: `${row.score}%` }} />
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-6">
                     <div className="flex flex-col">
                        <p className="text-xs font-bold text-white">{Math.floor(row.time_taken / 60)}m {row.time_taken % 60}s</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-widest">{new Date(row.completed_at).toLocaleDateString()}</p>
                     </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/results/${row.result_id || row.id}`)}
                          className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-indigo-400 hover:bg-white/10 transition-all"
                          title="View Details"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleReset(row.user_id)}
                          className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-red-400 hover:bg-white/10 transition-all"
                          title="Grant Retake"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      </div>
                  </td>
                </tr>
              ))}
              {data.roster.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-10 py-20 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                       <Users className="w-10 h-10" />
                       <p className="font-bold uppercase tracking-[0.2em] text-xs">Awaiting data submissions</p>
                    </div>
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

export default AdminAnalytics;
