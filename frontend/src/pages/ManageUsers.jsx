import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, MoreHorizontal, Shield, Mail, Calendar, UserPlus } from 'lucide-react';
import { adminService } from '../services/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async (search = '') => {
    try {
      setLoading(true);
      const response = await adminService.getStudents(search);
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(searchTerm);
    }, 500); // 500ms debounce for search
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredUsers = users; // Server-side handled now

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Email,Joined Date,Exams Taken,Avg Score (%)\n";
    users.forEach(u => {
      const date = new Date(u.created_at).toLocaleDateString();
      csvContent += `"${u.name}","${u.email}","${date}",${u.exams_taken},${u.avg_score || 0}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Student_Performance_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-extrabold text-white mb-2">
            User <span className="premium-gradient-text">Management</span>
          </h1>
          <p className="text-slate-400 font-medium">Oversee student accounts and platform access.</p>
        </motion.div>

        <div className="flex gap-4">
            <button 
              onClick={handleExportCSV}
              className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Export Results
            </button>
            <button className="btn-premium flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              <span>Invite Student</span>
            </button>
        </div>
      </section>

      <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
        <div className="px-10 py-6 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search candidates by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
              />
           </div>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{filteredUsers.length} Students Matching</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] border-b border-white/5">
                <th className="px-10 py-6">Candidate</th>
                <th className="px-10 py-6">Exams</th>
                <th className="px-10 py-6">Performance Index</th>
                <th className="px-10 py-6">Identity Stat</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                   <td colSpan="5" className="px-10 py-20 text-center">
                      <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
                   </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-indigo-400 font-bold overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} className="w-full h-full" alt="avatar" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{user.name}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                             <Mail className="w-3 h-3" /> {user.email}
                          </p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{user.exams_taken || 0}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Participated</span>
                     </div>
                  </td>
                  <td className="px-10 py-6">
                     <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center w-24">
                           <span className="text-[10px] font-black text-slate-500 uppercase">AVG</span>
                           <span className={`text-[10px] font-black ${user.avg_score >= 40 ? 'text-emerald-400' : 'text-slate-400'}`}>{user.avg_score || 0}%</span>
                        </div>
                        <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full ${user.avg_score >= 40 ? 'bg-emerald-400' : 'bg-slate-400'}`} style={{ width: `${user.avg_score || 0}%` }} />
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-6">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                           <Shield className="w-3 h-3" /> VERIFIED
                        </span>
                        <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                           {new Date(user.created_at).toLocaleDateString()}
                        </span>
                     </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                   <td colSpan="4" className="px-10 py-20 text-center">
                      <div className="opacity-30 flex flex-col items-center gap-2">
                         <Users className="w-10 h-10" />
                         <p className="font-bold uppercase tracking-[0.2em] text-[10px]">No users found</p>
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

export default ManageUsers;
