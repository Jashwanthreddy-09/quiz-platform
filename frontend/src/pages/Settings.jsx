import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Moon, Eye, Shield, Globe, Lock } from 'lucide-react';

const Settings = () => {
  const sections = [
    {
      title: 'Common Preferences',
      items: [
        { label: 'Push Notifications', desc: 'Get notified about new assessments and results.', icon: Bell, status: 'Enabled' },
        { label: 'Dark Mode', desc: 'Toggle high-contrast premium theme.', icon: Moon, status: 'Active' },
        { label: 'Public Profile', desc: 'Allow others to see your ranking on the leaderboard.', icon: Globe, status: 'Private' },
      ]
    },
    {
      title: 'Security & Access',
      items: [
        { label: 'Two-Factor Auth', desc: 'Add an extra layer of security to your account.', icon: Lock, status: 'Setup Required' },
        { label: 'Active Sessions', desc: 'View and manage your logged-in devices.', icon: Shield, status: '1 Active' },
      ]
    }
  ];

  return (
    <div className="space-y-10">
      <section>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
            <SettingsIcon className="w-10 h-10 text-indigo-500" />
            Platform <span className="premium-gradient-text">Settings</span>
          </h1>
          <p className="text-slate-400 font-medium">Customize your experience and manage security preferences.</p>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            {sections.map((section, idx) => (
              <div key={idx} className="glass-card p-10 rounded-[2.5rem] border-white/5">
                 <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                    {section.title}
                 </h3>
                 <div className="space-y-6">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group">
                         <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                               <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="font-bold text-white">{item.label}</p>
                               <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                            </div>
                         </div>
                         <div className="text-right">
                             <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${item.status === 'Active' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-slate-500 bg-white/5 border-white/10'}`}>
                                {item.status}
                             </span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            ))}
         </div>

         <div className="space-y-8">
            <div className="glass-card p-8 rounded-[2rem] bg-indigo-600/10 border-indigo-500/20">
               <div className="flex items-center gap-3 text-indigo-400 mb-4">
                  <Shield className="w-5 h-5" />
                  <span className="font-bold text-sm uppercase tracking-widest">Privacy Guard</span>
               </div>
               <p className="text-slate-300 text-sm leading-relaxed mb-6">Your data is encrypted and secure. We never share your assessment results with third parties without your consent.</p>
               <button className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/30 hover:bg-indigo-400 transition-all">
                  Request Privacy Audit
               </button>
            </div>
            
            <div className="glass-card p-8 rounded-[2rem] border-white/5 text-center">
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Version Control</p>
               <p className="text-white font-black">v2.4.0-premium</p>
               <p className="text-[10px] text-indigo-400 font-bold mt-4 cursor-pointer hover:underline uppercase tracking-tighter">View Release Notes</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Settings;
