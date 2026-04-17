import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { quizService } from '../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Coins, UserRound, ArrowRight, Zap, Clock, Star, TrendingUp } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ ranking: '-', points: 0 });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await studentService.getDashboard();
      setQuizzes(res.data.upcomingExams);
      setResults(res.data.results);
      setStats(res.data.stats);
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = (index) => {
    const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500'];
    return colors[index % colors.length];
  };

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getCountdown = (startTime) => {
    const start = new Date(startTime);
    const diff = start - now;
    if (diff <= 0) return 'Live Now';
    
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-10">
      {/* ... prev code ... */}
      <section>
        {/* ... header ... */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => {
            const isLive = new Date(quiz.start_time) <= now;
            return (
              <motion.div 
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => {
                  if (quiz.attempt_status === 'submitted') {
                    navigate(`/results/${quiz.id}`);
                  } else {
                    navigate(`/exam/attempt/${quiz.id}`);
                  }
                }}
                className="glass-card group rounded-[2rem] p-8 border-white/5 hover:border-indigo-500/30 cursor-pointer overflow-hidden relative"
              >
                <div className={`absolute -right-10 -top-10 w-32 h-32 blur-3xl opacity-10 rounded-full ${getRandomColor(index)} group-hover:opacity-20 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 ${getRandomColor(index)}/10 border border-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Zap className={`w-6 h-6 ${getRandomColor(index).replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {quiz.attempt_status === 'submitted' ? (
                        <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">Completed</span>
                      ) : (
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${isLive ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 animate-pulse' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}>
                          <Clock className="w-3 h-3" />
                          {isLive ? 'Live Session' : getCountdown(quiz.start_time)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{quiz.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-2">Standard competitive assessment with live leaderboard tracking and secure environment.</p>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">{quiz.duration} Mins</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Trophy className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Points: 100</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                     <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
                       {quiz.attempt_status === 'submitted' ? 'View Result' : isLive ? 'Join Assessment' : 'Coming Soon'}
                     </span>
                     <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform shadow-lg shadow-indigo-500/40">
                        <ArrowRight className="w-4 h-4" />
                     </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {quizzes.length === 0 && !loading && (
            <div className="col-span-full py-20 bg-white/5 border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-slate-500">
               <Zap className="w-10 h-10 mb-4 opacity-20" />
               <p className="font-bold">No active assessments found.</p>
               <p className="text-sm uppercase tracking-widest mt-2">Check back later for updates</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Results */}
      <section className="grid md:grid-cols-2 gap-8">
         <div className="glass-card p-10 rounded-[2.5rem]">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <Trophy className="w-5 h-5 text-amber-500" /> Recent Results
            </h3>
            <div className="space-y-4">
               {results.map((r, i) => (
                 <div 
                   key={i} 
                   onClick={() => navigate(`/results/${r.id}`)}
                   className="bg-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 cursor-pointer transition-all border border-transparent hover:border-white/5"
                 >
                    <div>
                       <p className="text-sm font-bold text-white">{r.quiz_title}</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Score: {r.score}% • {new Date(r.completed_at).toLocaleDateString()}</p>
                    </div>
                    <div className={`font-bold ${r.score >= 40 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {r.score >= 40 ? 'PASS' : 'FAIL'}
                    </div>
                 </div>
               ))}
               {results.length === 0 && (
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] text-center py-10">No records found</p>
               )}
            </div>
         </div>
         <div className="glass-card p-10 rounded-[2.5rem]">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <Coins className="w-5 h-5 text-indigo-400" /> Achievement Hub
            </h3>
            <div className="grid grid-cols-3 gap-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="aspect-square bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center flex-col gap-2 group cursor-pointer hover:border-indigo-500/30 transition-all">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                       <Star className="w-4 h-4 fill-current" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Top {10*i}%</span>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
