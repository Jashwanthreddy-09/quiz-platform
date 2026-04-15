import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  ArrowLeft, Download, Printer, Users, Target, CheckCircle2, TrendingUp 
} from 'lucide-react';

const AdminAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminService.getAnalytics(id);
        setData(response.data);
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
    
    // Headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Student Name,Email,Score (%),Time Taken (s),Completed At\n";
    
    // Rows
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

  if (loading) return <div className="text-slate-900 p-10">Loading Analytics...</div>;
  if (!data) return <div className="text-slate-900 p-10">Analytics not available.</div>;

  return (
    <div className="space-y-8 print:text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6 print:border-none">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 bg-slate-50 rounded-xl text-slate-600 hover:text-slate-900 print:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{data.quizTitle}</h1>
            <p className="text-slate-600 font-medium">Performance Analytics</p>
          </div>
        </div>
        <div className="flex gap-3 print:hidden">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-700 text-slate-900 px-5 py-2.5 rounded-xl font-bold transition-all text-sm"
          >
            <Printer className="w-4 h-4" /> Print PDF
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-slate-900 px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-lg shadow-primary/20"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col print:bg-white print:border-slate-300">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider print:text-slate-600">Total Attempts</span>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <span className="text-4xl font-black">{data.summary.totalAttempts}</span>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col print:bg-white print:border-slate-300">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider print:text-slate-600">Average Score</span>
            <Target className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-4xl font-black">{data.summary.averageScore}%</span>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col print:bg-white print:border-slate-300">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider print:text-slate-600">Highest Score</span>
            <Trophy className="w-5 h-5 text-accent" />
          </div>
          <span className="text-4xl font-black text-accent">{data.summary.highestScore}%</span>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col print:bg-white print:border-slate-300">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider print:text-slate-600">Pass Rate</span>
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-4xl font-black text-blue-400">{data.summary.passRate}%</span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white shadow-xl shadow-slate-200/50 border border-slate-200 rounded-[2.5rem] p-8 print:bg-white print:border-slate-300">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-8 print:text-black">
          <TrendingUp className="w-5 h-5 text-primary" /> Score Distribution
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white shadow-xl shadow-slate-200/50 border border-slate-200 rounded-[2.5rem] overflow-hidden print:bg-white print:border-slate-300">
        <div className="px-8 py-5 border-b border-slate-200 bg-white print:border-slate-300 print:bg-slate-50">
           <h3 className="text-sm font-black uppercase tracking-widest text-slate-600 print:text-slate-600">Student Roster</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left print:text-black">
            <thead>
              <tr className="text-xs uppercase font-black text-slate-500 tracking-wider border-b border-slate-200 print:border-slate-300">
                <th className="px-8 py-5 whitespace-nowrap">Student</th>
                <th className="px-8 py-5 whitespace-nowrap">Email</th>
                <th className="px-8 py-5 whitespace-nowrap">Score</th>
                <th className="px-8 py-5 whitespace-nowrap">Time Taken</th>
                <th className="px-8 py-5 whitespace-nowrap">Date Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30 print:divide-slate-200">
              {data.roster.map((row, i) => (
                <tr key={i} className="hover:bg-white transition-colors">
                  <td className="px-8 py-4 font-bold whitespace-nowrap">{row.student_name}</td>
                  <td className="px-8 py-4 text-slate-600 text-sm whitespace-nowrap print:text-slate-600">{row.student_email}</td>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <span className={`font-black ${row.score >= (data.quizPassingPercentage || 40) ? 'text-accent' : 'text-red-400'} print:!text-black`}>
                      {row.score}%
                    </span>
                  </td>
                  <td className="px-8 py-4 text-slate-600 text-sm whitespace-nowrap print:text-slate-600">
                    {Math.floor(row.time_taken / 60)}m {row.time_taken % 60}s
                  </td>
                  <td className="px-8 py-4 text-slate-500 text-sm whitespace-nowrap print:text-slate-600">
                    {new Date(row.completed_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {data.roster.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-12 text-center text-slate-500 font-medium">
                    No attempts have been made yet.
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
