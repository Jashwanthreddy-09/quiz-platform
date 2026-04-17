import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  ArrowUpRight, 
  MoreHorizontal,
  Clock,
  Calendar,
  Zap,
  TrendingUp,
  Activity,
  PlusCircle,
  FileText,
  Trash2
} from 'lucide-react';
import { adminService, quizService } from '../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getStats();
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    // POLLLING: Refresh data every 30 seconds
    const poll = setInterval(fetchStats, 30000);
    return () => clearInterval(poll);
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you absolutely sure you want to delete "${title}"? This will permanently remove all associated questions, attempts, and results.`)) {
      return;
    }
    try {
      await quizService.delete(id);
      // Refresh statistics after deletion
      const response = await adminService.getStats();
      setData(response.data);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete exam");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Real-time Console...</p>
    </div>
  );

  const stats = [
    { name: 'Total Students', value: data?.stats?.totalStudents || 0, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { name: 'Active Quizzes', value: data?.stats?.totalExams || 0, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { name: 'Submissions', value: data?.stats?.totalSubmissions || 0, icon: CheckCircle, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <h1 className="text-4xl font-extrabold text-white mb-2">Management <span className="premium-gradient-text">Overview</span></h1>
            <p className="text-slate-400 font-medium capitalize">Real-time platform metrics and activity monitoring</p>
        </motion.div>
        
        <div className="flex gap-3">
             <button onClick={() => navigate('/admin/exams/new')} className="btn-premium flex items-center gap-2 text-sm py-2.5 px-5">
                 <PlusCircle className="w-4 h-4" /> Create New Exam
             </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 rounded-[2.5rem] group hover:border-purple-500/30 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-8">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border border-white/5`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-right">
                  <span className="flex items-center text-emerald-400 text-xs font-black bg-emerald-400/10 px-2 py-1 rounded-lg border border-emerald-400/20">
                    Live <Activity className="w-3 h-3 ml-1 fill-current animate-pulse" />
                  </span>
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">{stat.name}</p>
              <h2 className="text-4xl font-black text-white mt-2 group-hover:premium-gradient-text transition-all tracking-tight">{stat.value}</h2>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Usage Trends */}
      <div className="glass-card p-10 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
               <TrendingUp className="w-5 h-5 text-indigo-400" /> Platform Traffic Trends
            </h3>
          </div>
          <div className="h-80 w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trends}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'}}
                  itemStyle={{color: '#8b5cf6', fontWeight: 800}}
                />
                <Area type="monotone" dataKey="submissions" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorSub)" dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#030712' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Upcoming Exams (Calendar style list) */}
        <div className="glass-card p-10 rounded-[2.5rem] flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
               <Calendar className="w-5 h-5 text-indigo-400" /> Upcoming Exams
            </h3>
          </div>
          <div className="space-y-4 flex-1">
             {data?.upcomingExams?.length > 0 ? data.upcomingExams.map((exam, i) => (
               <div key={exam.id} className="flex items-center gap-6 p-5 bg-white/5 border border-white/5 rounded-3xl hover:border-indigo-500/30 transition-all border-l-4 border-l-indigo-500 group">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex flex-col items-center justify-center border border-indigo-500/20">
                     <span className="text-[10px] font-black text-indigo-400 uppercase">{new Date(exam.start_time).toLocaleString('en-US', { month: 'short' })}</span>
                     <span className="text-lg font-black text-white leading-none">{new Date(exam.start_time).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-sm font-bold text-white truncate uppercase tracking-tight">{exam.title}</h4>
                     <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Starts at {new Date(exam.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(exam.id, exam.title); }}
                    className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Quick Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
             )) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 py-10 opacity-30">
                  <Clock className="w-10 h-10 mb-4" />
                  <p className="font-bold uppercase tracking-[0.2em] text-xs">No Scheduled Events</p>
               </div>
             )}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="glass-card p-10 rounded-[2.5rem] flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
               <Zap className="w-5 h-5 text-amber-400" /> Live Feed
            </h3>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {data?.recentSubmissions?.map((sub, idx) => (
              <motion.div 
                key={sub.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(`/admin/results/${sub.id}`)}
                className="bg-white/5 border border-white/10 p-5 rounded-3xl group cursor-pointer hover:border-amber-500/30 transition-all"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500 border border-white/5">
                    {sub.student_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                       <h4 className="font-bold text-sm text-white truncate group-hover:text-amber-400 transition-colors uppercase tracking-tight">{sub.student_name}</h4>
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${sub.score >= 40 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>{sub.score}%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Completed {sub.quiz_title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            {(!data || data?.recentSubmissions?.length === 0) && (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 py-10 opacity-30">
                  <CheckCircle className="w-10 h-10 mb-4" />
                  <p className="font-bold uppercase tracking-[0.2em] text-xs">Awaiting Submissions</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
