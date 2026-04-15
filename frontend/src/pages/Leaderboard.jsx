import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leaderboardService } from '../services/api';
import { ChevronLeft, Crown } from 'lucide-react';
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

  if (loading) return <div className="text-center p-10 font-bold text-teal-600">Loading Leaderboard...</div>;

  const top3 = data.slice(0, 3);
  const others = data.slice(3);

  // Mock avatars for the example UI
  const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jude"
  ];

  return (
    <div className="max-w-5xl mx-auto w-full font-sans">
      <div className="w-full bg-white rounded-[2rem] shadow-sm border border-slate-200 relative overflow-hidden">
        
        {/* Top curved teal background area */}
        <div className="bg-[#41b8b8] px-6 pt-10 pb-[120px] rounded-b-[4rem] relative overflow-hidden">
          
          {/* Decorative floating bubbles */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between mb-8">
            <button onClick={() => navigate('/dashboard')} className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-white text-xl font-bold">Leaderboard</h1>
            <div className="w-10"></div> {/* Spacer */}
          </div>

          {/* Segment Control Placeholder */}
          <div className="relative z-10 flex bg-white/20 p-1.5 rounded-full mb-12 max-w-[90%] mx-auto backdrop-blur-md">
             <button className="flex-1 bg-white text-teal-600 font-bold text-sm py-2 rounded-full shadow-md">All time</button>
             <button className="flex-1 text-white font-medium text-sm py-2">This week</button>
             <button className="flex-1 text-white font-medium text-sm py-2">Month</button>
          </div>

          {/* Podium */}
          {top3.length > 0 && (
            <div className="relative z-10 flex justify-center items-end h-40 gap-4 mt-6">
              
              {/* Rank 2 */}
              {top3[1] && (
                <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.1}} className="flex flex-col items-center mb-8">
                   <div className="relative">
                     <img src={avatars[1]} className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-teal-100 object-cover" alt="avatar" />
                     <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-teal-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-black shadow-md">2</div>
                   </div>
                   <span className="text-white text-xs font-bold mt-4">{top3[1].student_name}</span>
                   <span className="text-white/80 text-[10px] font-black mt-1">{top3[1].score} pts</span>
                </motion.div>
              )}

              {/* Rank 1 */}
              <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} className="flex flex-col items-center">
                   <Crown className="w-8 h-8 text-yellow-300 fill-yellow-300 mb-2 drop-shadow-md z-20" />
                   <div className="relative z-10">
                     <img src={avatars[0]} className="w-[84px] h-[84px] rounded-full border-4 border-yellow-300 shadow-xl bg-orange-100 object-cover" alt="avatar" />
                     <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-white text-[11px] font-black shadow-md">1</div>
                   </div>
                   <span className="text-white text-sm font-bold mt-4">{top3[0].student_name}</span>
                   <span className="text-white/90 text-xs font-black mt-1">{top3[0].score} pts</span>
              </motion.div>

              {/* Rank 3 */}
              {top3[2] && (
                 <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.2}} className="flex flex-col items-center mb-6">
                   <div className="relative">
                     <img src={avatars[2]} className="w-[60px] h-[60px] rounded-full border-4 border-white shadow-lg bg-red-100 object-cover" alt="avatar" />
                     <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-teal-600 border-2 border-white flex items-center justify-center text-white text-[9px] font-black shadow-md">3</div>
                   </div>
                   <span className="text-white text-xs font-bold mt-4">{top3[2].student_name}</span>
                   <span className="text-white/80 text-[10px] font-black mt-1">{top3[2].score} pts</span>
                </motion.div>
              )}

            </div>
          )}

        </div>

        {/* List View Container */}
        <div className="px-6 -mt-[60px] relative z-20 pb-10">
          <div className="bg-white rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] w-full py-4 min-h-[300px]">
             
            {others.map((userRow, index) => (
              <motion.div 
                initial={{opacity: 0, x: -10}} animate={{opacity: 1, x: 0}} transition={{delay: index * 0.05}}
                key={index} className="flex items-center justify-between py-4 px-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-center text-slate-400 font-bold text-sm">{index + 4}</span>
                  <div className="w-10 h-10 rounded-full bg-slate-200 shadow-inner overflow-hidden border border-slate-200">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userRow.student_name}`} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{userRow.student_name}</span>
                </div>
                <span className="font-black text-teal-400 text-sm">{userRow.score}</span>
              </motion.div>
            ))}

            {data.length === 0 && !loading && (
              <div className="text-center py-10 text-slate-400">No ranks available yet.</div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;
