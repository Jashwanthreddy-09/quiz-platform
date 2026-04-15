import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFiles = [
  'src/pages/StudentDashboard.jsx',
  'src/pages/AdminDashboard.jsx',
  'src/pages/ExamAttempt.jsx',
  'src/pages/ResultDetail.jsx',
  'src/pages/Leaderboard.jsx',
  'src/pages/AdminAnalytics.jsx'
];

targetFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex rules to map colors
  content = content.replace(/bg-indigo-600\/10/g, 'bg-primary/10');
  content = content.replace(/bg-indigo-600\/20/g, 'bg-primary/20');
  content = content.replace(/bg-indigo-600/g, 'bg-primary');
  content = content.replace(/bg-indigo-700/g, 'bg-primary/90');
  content = content.replace(/text-indigo-400/g, 'text-primary');
  content = content.replace(/text-indigo-300/g, 'text-primary');
  content = content.replace(/text-indigo-500\/70/g, 'text-primary/70');
  content = content.replace(/text-indigo-500/g, 'text-primary');
  content = content.replace(/bg-indigo-500\/10/g, 'bg-primary/10');
  content = content.replace(/shadow-indigo-600\/10/g, 'shadow-primary/10');
  content = content.replace(/shadow-indigo-600\/20/g, 'shadow-primary/20');
  content = content.replace(/shadow-indigo-500\/20/g, 'shadow-primary/20');
  content = content.replace(/border-indigo-500\/50/g, 'border-primary/50');
  content = content.replace(/border-indigo-500\/20/g, 'border-primary/20');
  content = content.replace(/border-indigo-500/g, 'border-primary');
  content = content.replace(/border-indigo-600/g, 'border-primary');
  
  content = content.replace(/bg-purple-400\/10/g, 'bg-secondary/10');
  content = content.replace(/text-purple-400/g, 'text-secondary');
  content = content.replace(/text-purple-500/g, 'text-secondary');
  
  content = content.replace(/bg-slate-900\/80/g, 'bg-dark/80');
  content = content.replace(/bg-slate-900\/50/g, 'bg-dark/50');
  content = content.replace(/bg-slate-900\/30/g, 'bg-dark/30');
  content = content.replace(/bg-slate-900/g, 'bg-dark');
  content = content.replace(/bg-slate-950/g, 'bg-[#0b1120]');
  
  // Emerald to accent
  content = content.replace(/bg-emerald-600/g, 'bg-accent');
  content = content.replace(/bg-emerald-700/g, 'bg-accent/90');
  content = content.replace(/bg-emerald-500\/20/g, 'bg-accent/20');
  content = content.replace(/bg-emerald-500\/10/g, 'bg-accent/10');
  content = content.replace(/bg-emerald-500\/5/g, 'bg-accent/5');
  content = content.replace(/border-emerald-500\/30/g, 'border-accent/30');
  content = content.replace(/border-emerald-500\/20/g, 'border-accent/20');
  content = content.replace(/border-emerald-500\/10/g, 'border-accent/10');
  content = content.replace(/text-emerald-400/g, 'text-accent');
  content = content.replace(/text-emerald-500\/50/g, 'text-accent/50');
  content = content.replace(/text-emerald-500/g, 'text-accent');
  content = content.replace(/shadow-emerald-600\/20/g, 'shadow-accent/20');

  // Enhance premium UI components with glassmorphism and nicer borders
  content = content.replace(/rounded-3xl/g, 'rounded-[2rem]');
  content = content.replace(/border-slate-700\/50/g, 'border-white/5');
  content = content.replace(/border-slate-700\/30/g, 'border-white/5');
  content = content.replace(/border-slate-700/g, 'border-white/10');
  content = content.replace(/border-slate-800\/50/g, 'border-white/5');
  content = content.replace(/border-slate-800\/40/g, 'border-white/5');
  content = content.replace(/border-slate-800\/30/g, 'border-white/5');
  content = content.replace(/border-slate-800/g, 'border-white/5');

  // Improve dashboards specifically if present
  if (file.includes('Dashboard')) {
     content = content.replace(/bg-slate-800/g, 'bg-white/5 backdrop-blur-xl');
     content = content.replace(/text-3xl font-bold/g, 'text-4xl font-black tracking-tight text-white');
  }

  // Improve quiz page specifically
  if (file.includes('ExamAttempt')) {
     content = content.replace(/bg-slate-800/g, 'bg-white/5 backdrop-blur-md');
  }

  if (file.includes('ResultDetail')) {
     content = content.replace(/bg-slate-800\/50/g, 'bg-white/5 backdrop-blur-xl');
     content = content.replace(/bg-slate-800\/30/g, 'bg-white/5 backdrop-blur-lg');
  }

  if (file.includes('Leaderboard')) {
     content = content.replace(/bg-slate-800\/20/g, 'bg-white/5 backdrop-blur-xl');
     content = content.replace(/bg-slate-800\/30/g, 'bg-white/5');
     content = content.replace(/bg-slate-800\/40/g, 'bg-white/10');
     content = content.replace(/bg-slate-800/g, 'bg-white/5');
  }

  if (file.includes('AdminAnalytics')) {
     content = content.replace(/bg-slate-800\/20/g, 'bg-white/5 backdrop-blur-xl');
     content = content.replace(/bg-slate-800\/30/g, 'bg-white/5');
     content = content.replace(/bg-slate-800\/50/g, 'bg-white/5');
     content = content.replace(/bg-slate-800/g, 'bg-white/10');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated UI for ${file}`);
});
