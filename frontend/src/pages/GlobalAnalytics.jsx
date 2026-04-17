import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Users, BookOpen, Clock, Target, Calendar } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import api from '../services/api';

const GlobalAnalytics = () => {
  const [data, setData] = useState({
    trends: [
      { name: 'Mon', active: 400, completions: 240 },
      { name: 'Tue', active: 300, completions: 139 },
      { name: 'Wed', active: 200, completions: 980 },
      { name: 'Thu', active: 278, completions: 390 },
      { name: 'Fri', active: 189, completions: 480 },
      { name: 'Sat', active: 239, completions: 380 },
      { name: 'Sun', active: 349, completions: 430 },
    ],
    distribution: [
      { name: 'Technical', value: 400 },
      { name: 'Aptitude', value: 300 },
      { name: 'Coding', value: 300 },
      { name: 'Soft Skills', value: 200 },
    ]
  });
  const [loading, setLoading] = useState(false);

  // Mock colors
  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

  return (
    <div className="space-y-10">
      <section>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Platform <span className="premium-gradient-text">Analytics</span>
          </h1>
          <p className="text-slate-400 font-medium">Aggregated insights across all assessments and user activity.</p>
        </motion.div>
      </section>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Avg Pass Rate', value: '78%', icon: Target, color: 'text-emerald-400' },
           { label: 'Active Today', value: '1,240', icon: Activity, color: 'text-indigo-400' },
           { label: 'Total Hours', value: '4,892', icon: Clock, color: 'text-purple-400' },
           { label: 'Engagement', value: '+12%', icon: TrendingUp, color: 'text-cyan-400' },
         ].map((stat, i) => (
           <div key={i} className="glass-card p-6 rounded-[2rem] border-white/5">
              <div className="flex justify-between items-start mb-4">
                 <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                 </div>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* Trend Chart */}
         <div className="glass-card p-10 rounded-[2.5rem]">
            <h3 className="text-xl font-bold text-white mb-10 flex items-center gap-3">
               <TrendingUp className="w-5 h-5 text-indigo-400" /> Platform Engagement
            </h3>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trends}>
                     <defs>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                     <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} />
                     <Area type="monotone" dataKey="active" stroke="#6366f1" fillOpacity={1} fill="url(#colorActive)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Distribution Chart */}
         <div className="glass-card p-10 rounded-[2.5rem]">
            <h3 className="text-xl font-bold text-white mb-10 flex items-center gap-3">
               <BookOpen className="w-5 h-5 text-purple-400" /> Assessment Categories
            </h3>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={data.distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {data.distribution.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default GlobalAnalytics;
