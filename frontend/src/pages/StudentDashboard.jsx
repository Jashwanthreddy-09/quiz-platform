import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { quizService, examService } from '../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Coins, UserRound, ArrowLeft } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({ ranking: 348, Math: 1209 }); // Mock stats for UI
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const qRes = await quizService.getAll();
      setQuizzes(qRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getCardIcon = (index) => {
    const emojis = ["🏀", "🧪", "🧮", "📅", "🧬", "🗺️"];
    return emojis[index % emojis.length];
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header section */}
        <div className="p-8 pb-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-800">Hi, {user?.name?.split(' ')[0] || 'John'}</h1>
              <p className="text-slate-400 font-medium text-sm mt-1">Let's make this day productive</p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
              <UserRound className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center justify-around">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ranking</span>
              </div>
              <span className="text-xl font-bold text-sky-500">{stats.ranking}</span>
            </div>
            <div className="w-px h-10 bg-slate-100"></div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Points</span>
              </div>
              <span className="text-xl font-bold text-sky-500">{stats.Math}</span>
            </div>
          </div>
        </div>

        {/* Quizzes Section */}
        <div className="p-8">
          <h2 className="text-xl font-black text-slate-800 mb-6">Let's play</h2>
          
          <div className="grid grid-cols-2 gap-5">
            {quizzes.map((quiz, index) => (
              <motion.div 
                key={quiz.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/exam/attempt/${quiz.id}`)}
                className="bg-white rounded-[2rem] p-6 shadow-[0_10px_25px_rgba(0,0,0,0.06)] border border-slate-100 cursor-pointer flex flex-col items-center justify-center text-center group transition-shadow hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)]"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform drop-shadow-xl">
                  {getCardIcon(index)}
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{quiz.title}</h3>
                <p className="text-slate-400 text-xs font-medium mt-1">{quiz.time_limit} mins</p>
              </motion.div>
            ))}
            
            {quizzes.length === 0 && (
               <div className="col-span-2 text-center text-slate-500 py-10">No quizzes available right now.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
