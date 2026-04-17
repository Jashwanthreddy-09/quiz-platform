import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leaderboardService } from '../services/api';
import { ChevronLeft, Crown, Sparkles, Trophy, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Leaderboard = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = quizId 
          ? await leaderboardService.getByQuiz(quizId) 
          : await leaderboardService.getGlobal();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [quizId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Fetching Ranks...</p>
    </div>
  );

  const top3 = data.slice(0, 3);
  const others = data.slice(3);

  const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jude"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
           <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                 <ChevronLeft className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm uppercase tracking-widest">Back</span>
           </button>
           <div className="text-center">
              <h1 className="text-3xl font-black text-white">Elite <span className="premium-gradient-text">Leaderboard</span></h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Real-time Global Rankings</p>
           </div>
           <div className="w-20" /> {/* Spacer */}
      </div>

      {/* Podium Section */}
      <div className="relative pt-20 pb-10">
          <div className="blob w-[400px] h-[400px] bg-indigo-600/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative z-10 flex justify-center items-end gap-4 md:gap-12">
              {/* Rank 2 */}
              {top3[1] && (
                <motion.div initial={{y: 50, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.2}} className="flex flex-col items-center">
                   <div className="relative mb-6">
                      <div className="absolute -inset-2 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-slate-700/50 p-1 relative z-10">
                         <img src={avatars[1]} className="w-full h-full rounded-full bg-slate-800 object-cover" alt="avatar" />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-700 border-2 border-white/10 flex items-center justify-center text-white text-xs font-black shadow-lg">2</div>
                   </div>
                   <div className="text-center">
                      <p className="text-white font-bold text-sm truncate max-w-[100px]">{top3[1].student_name}</p>
                      <p className="text-indigo-400 text-xs font-black mt-1 uppercase">{top3[1].score} pts</p>
                   </div>
                </motion.div>
              )}

              {/* Rank 1 */}
              {top3[0] && (
                <motion.div initial={{y: 30, opacity: 0, scale: 0.9}} animate={{y: 0, opacity: 1, scale: 1}} transition={{duration: 0.5}} className="flex flex-col items-center">
                   <div className="relative mb-8">
                      <Crown className="absolute -top-10 left-1/2 -translate-x-1/2 w-10 h-10 text-amber-400 fill-amber-400 animate-bounce" />
                      <div className="absolute -inset-4 bg-amber-400/20 rounded-full blur-2xl animate-pulse" />
                      <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-amber-400 p-1 relative z-10 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                         <img src={avatars[0]} className="w-full h-full rounded-full bg-slate-800 object-cover" alt="avatar" />
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-400 border-2 border-[#030712] flex items-center justify-center text-[#030712] text-sm font-black shadow-lg">1</div>
                   </div>
                   <div className="text-center">
                      <h3 className="text-xl font-black text-white">{top3[0].student_name}</h3>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 mt-2">
                         <Sparkles className="w-3 h-3 text-amber-400" />
                         <span className="text-amber-400 text-xs font-black uppercase">{top3[0].score} pts</span>
                      </div>
                   </div>
                </motion.div>
              )}

              {/* Rank 3 */}
              {top3[2] && (
                <motion.div initial={{y: 60, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.3}} className="flex flex-col items-center">
                   <div className="relative mb-6">
                      <div className="absolute -inset-2 bg-purple-500/10 rounded-full blur-xl" />
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-slate-700/50 p-1 relative z-10">
                         <img src={avatars[2]} className="w-full h-full rounded-full bg-slate-800 object-cover" alt="avatar" />
                      </div>
                      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center text-white text-[10px] font-black shadow-lg">3</div>
                   </div>
                   <div className="text-center">
                      <p className="text-white font-bold text-sm truncate max-w-[80px]">{top3[2].student_name}</p>
                      <p className="text-purple-400 text-xs font-black mt-1 uppercase">{top3[2].score} pts</p>
                   </div>
                </motion.div>
              )}
          </div>
      </div>

      {/* Others List */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5">
         <div className="bg-white/5 px-8 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rankings #4 - #{data.length}</span>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                   <Trophy className="w-3 h-3 text-indigo-400" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Pro League</span>
                </div>
            </div>
         </div>
         
         <div className="divide-y divide-white/5">
            {others.map((userRow, index) => (
              <motion.div 
                key={index}
                initial={{opacity: 0, x: -20}}
                whileInView={{opacity: 1, x: 0}}
                viewport={{once: true}}
                transition={{delay: index * 0.05}}
                className="flex items-center justify-between py-6 px-8 hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <span className="w-8 text-center text-slate-600 font-black text-sm group-hover:text-indigo-400 transition-colors">#{index + 4}</span>
                  <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity" />
                      <div className="w-12 h-12 rounded-full border border-white/10 p-0.5 relative z-10 transition-transform group-hover:scale-110">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userRow.student_name}`} className="w-full h-full rounded-full bg-slate-800" />
                      </div>
                  </div>
                  <div>
                      <span className="font-bold text-white text-base block">{userRow.student_name}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Verified Competitor</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col items-end">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency</span>
                       <span className="text-xs font-black text-white">94%</span>
                    </div>
                    <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 group-hover:border-indigo-500/30 transition-all">
                       <span className="font-black text-indigo-400 text-sm">{userRow.score} <span className="text-[10px] opacity-60 ml-0.5">PTS</span></span>
                    </div>
                </div>
              </motion.div>
            ))}

            {data.length === 0 && (
               <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                  <Star className="w-10 h-10 mb-4 opacity-10" />
                  <p className="font-bold uppercase tracking-widest text-xs">No entries available</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Leaderboard;
