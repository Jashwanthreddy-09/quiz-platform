import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Camera, Edit3, Save, X, CheckCircle2, AtSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ ranking: '-', points: 0, examsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [pRes, dRes] = await Promise.all([
        profileService.get(),
        studentService.getDashboard()
      ]);
      setProfile(pRes.data);
      setFormData({ name: pRes.data.name, username: pRes.data.username || '' });
      setStats({
        ...dRes.data.stats,
        examsCount: dRes.data.results.length
      });
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await profileService.update(formData);
      setProfile(prev => ({ ...prev, ...formData }));
      setEditing(false);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('profilePic', file);

    setUploading(true);
    try {
      const res = await profileService.uploadPic(data);
      setProfile(prev => ({ ...prev, profile_pic: res.data.filePath }));
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Accessing Profile...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <section>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
            <User className="w-10 h-10 text-cyan-500" />
            Identity <span className="premium-gradient-text">Profile</span>
          </h1>
          <p className="text-slate-400 font-medium">Manage your digital presence and verification details.</p>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
               
               <div className="flex flex-col md:flex-row items-center gap-10 mb-10 pb-10 border-b border-white/5 relative z-10">
                  <div className="relative group">
                     {profile?.profile_pic ? (
                        <img 
                          src={`http://localhost:5000${profile.profile_pic}`} 
                          className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white/5 shadow-2xl transition-transform group-hover:scale-105"
                          alt="Profile" 
                        />
                     ) : (
                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-4 border-white/5 flex items-center justify-center text-5xl text-cyan-400 font-black shadow-inner">
                           {profile?.name?.[0] || 'U'}
                        </div>
                     )}
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       disabled={uploading}
                       className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl hover:bg-indigo-400 transition-all border-4 border-[#030712]"
                     >
                        {uploading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
                     </button>
                     <input 
                       ref={fileInputRef}
                       type="file" 
                       className="hidden" 
                       accept="image/*"
                       onChange={handleFileChange}
                     />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                     <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">{profile?.name || 'User Name'}</h2>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest self-center md:self-auto">
                           <Shield className="w-3 h-3" /> {profile?.role || 'Student'}
                        </span>
                     </div>
                     <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start gap-2">
                        <AtSign className="w-4 h-4 text-indigo-400" /> {profile?.username || 'no-username-set'}
                     </p>
                  </div>

                  <button 
                    onClick={() => {
                        if (editing) handleUpdate();
                        else setEditing(true);
                    }}
                    className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${editing ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'}`}
                  >
                     <div className="flex items-center gap-2">
                        {editing ? <><Save className="w-4 h-4" /> Save Changes</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
                     </div>
                  </button>
               </div>

               <div className="space-y-10 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Full Identity Name</label>
                        {editing ? (
                           <input 
                             type="text"
                             className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500/50 outline-none transition-all font-bold"
                             value={formData.name}
                             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                           />
                        ) : (
                           <div className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold opacity-80 flex items-center justify-between">
                              {profile?.name} <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
                           </div>
                        )}
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Global ID (Username)</label>
                        {editing ? (
                           <input 
                             type="text"
                             className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500/50 outline-none transition-all font-bold"
                             value={formData.username}
                             placeholder="Set your unique username..."
                             onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                           />
                        ) : (
                           <div className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold opacity-80">
                              {profile?.username || '-'}
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
                           <Mail className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified Email</p>
                           <p className="text-white font-bold">{profile?.email}</p>
                        </div>
                     </div>
                     <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest text-center">
                        Verified Primary
                     </span>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="glass-card p-10 rounded-[2.5rem] border-white/5 text-center">
               <div className="w-20 h-20 rounded-full bg-cyan-500/10 mx-auto flex items-center justify-center mb-6">
                  <Shield className="w-10 h-10 text-cyan-400" />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Verification Check</h3>
               <p className="text-slate-500 text-sm leading-relaxed mb-8">Your account is currently in good standing. All evaluation modules are accessible.</p>
               <div className="py-3 px-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                  Status: Academic Elite
               </div>
            </div>

            <div className="glass-card p-10 rounded-[2.5rem] border-white/5">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8">Platform Usage</h3>
                <div className="space-y-6">
                 {[
                    { label: 'Exams Completed', value: stats.examsCount, color: 'bg-indigo-500' },
                    { label: 'Global Ranking', value: `#${stats.ranking}`, color: 'bg-cyan-500' },
                    { label: 'Total Points', value: stats.points, color: 'bg-purple-500' },
                 ].map((stat, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-widest">
                          <span>{stat.label}</span>
                          <span className="text-white">{stat.value}</span>
                       </div>
                       <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <div className={`h-full ${stat.color} w-3/4`} />
                       </div>
                    </div>
                 ))}
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Profile;

