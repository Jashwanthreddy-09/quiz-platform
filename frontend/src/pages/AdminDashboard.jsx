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
  Calendar
} from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-slate-900">Loading data...</div>;

  const stats = [
    { name: 'Total Students', value: data?.stats.totalStudents || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Active Quizzes', value: data?.stats.totalExams || 0, icon: BookOpen, color: 'text-primary', bg: 'bg-indigo-400/10' },
    { name: 'Submissions', value: data?.stats.totalSubmissions || 0, icon: CheckCircle, color: 'text-accent', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Good Morning, Admin</h1>
        <p className="text-slate-600 mt-1">Here's what's happening with your platform today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white shadow-xl shadow-slate-200/50 border border-slate-200 p-6 rounded-[2rem] group hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center text-accent text-sm font-bold bg-emerald-400/10 px-2 py-1 rounded-lg">
                +12% <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-6">
              <p className="text-slate-600 font-medium">{stat.name}</p>
              <h2 className="text-4xl font-black mt-1">{stat.value}</h2>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white shadow-xl shadow-slate-200/50 border border-slate-200 p-8 rounded-[2rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Submission Activity</h3>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2 outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trends}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="submissions" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSub)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Exams List */}
        <div className="bg-white shadow-xl shadow-slate-200/50 border border-slate-200 p-8 rounded-[2rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Recent Exams</h3>
            <button className="text-primary hover:text-primary text-sm font-bold">View All</button>
          </div>
          <div className="space-y-6">
            {data?.recentExams.map((exam) => (
              <div 
                key={exam.id} 
                className="flex items-start justify-between group cursor-pointer"
                onClick={() => navigate(`/admin/exams/${exam.id}/analytics`)}
              >
                <div className="flex gap-4 items-center w-full">
                  <div className="bg-slate-700/50 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <BarChart className="w-5 h-5 text-primary group-hover:text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{exam.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                       <span>{exam.duration || 0} mins</span>
                       <span className="font-bold text-primary/70">{exam.submissions || 0} takes</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {data?.recentExams.length === 0 && (
               <p className="text-slate-500 text-sm text-center py-10">No exams created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
