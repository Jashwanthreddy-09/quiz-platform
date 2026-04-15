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

  // Convert dark theme text into light theme text
  content = content.replace(/text-white/g, 'text-slate-900');
  content = content.replace(/text-slate-300/g, 'text-slate-700');
  content = content.replace(/text-slate-400/g, 'text-slate-600');
  content = content.replace(/text-slate-500/g, 'text-slate-500');

  // Convert dark theme backgrounds to light theme
  content = content.replace(/bg-\[\#0b1120\]/g, 'bg-slate-50');
  content = content.replace(/bg-dark\/80/g, 'bg-white/90');
  content = content.replace(/bg-dark\/50/g, 'bg-white');
  content = content.replace(/bg-dark\/30/g, 'bg-white');
  content = content.replace(/bg-dark/g, 'bg-slate-50');
  
  // Undo glassmorphism that caused issues in light theme
  content = content.replace(/bg-white\/5 backdrop-blur-xl/g, 'bg-white shadow-xl shadow-slate-200/50');
  content = content.replace(/bg-white\/5 backdrop-blur-md/g, 'bg-white shadow-md');
  content = content.replace(/bg-white\/5 backdrop-blur-lg/g, 'bg-white shadow-lg');
  content = content.replace(/bg-white\/5/g, 'bg-white');
  content = content.replace(/bg-white\/10/g, 'bg-slate-50');
  
  // Fix Borders
  content = content.replace(/border-white\/5/g, 'border-slate-200');
  content = content.replace(/border-white\/10/g, 'border-slate-200');
  
  // Specific tweaks
  if (file.includes('ExamAttempt')) {
     content = content.replace(/bg-slate-900\/50/g, 'bg-white');
     content = content.replace(/bg-slate-900\/80/g, 'bg-slate-50');
     content = content.replace(/bg-slate-900\/30/g, 'bg-white');
     content = content.replace(/bg-slate-900/g, 'bg-slate-50');
     content = content.replace(/border-slate-800/g, 'border-slate-200');
     content = content.replace(/border-slate-700/g, 'border-slate-300');
  }
  
  if (file.includes('Dashboard')) {
     content = content.replace(/text-4xl font-black tracking-tight text-slate-900/g, 'text-3xl font-bold text-slate-900');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated Light UI for ${file}`);
});
