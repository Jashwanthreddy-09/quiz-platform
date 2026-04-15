import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import { Play, Terminal, Loader2, RefreshCcw } from 'lucide-react';
import { executionService } from '../services/api';

const CodeIDE = ({ initialCode, onCodeChange, language: defaultLang = 'javascript' }) => {
  const [code, setCode] = useState(initialCode || '');
  const [language, setLanguage] = useState(defaultLang);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      const res = await executionService.run(language, code);
      setOutput(res.data.output);
      setError(res.data.error);
    } catch (err) {
      setError(err.response?.data?.error || "Execution failed.");
    } finally {
      setIsRunning(false);
    }
  };

  const getLanguagePrism = () => {
    if (language === 'python') return languages.python;
    return languages.javascript;
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl">
      {/* Toolbar */}
      <div className="h-14 bg-[#252526] border-b border-white/5 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#3c3c3c] text-slate-300 text-xs font-bold py-1.5 px-3 rounded-lg border-none outline-none cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
          <div className="w-[1px] h-4 bg-white/10 mx-2" />
          <button 
            onClick={() => setCode('')} 
            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
            title="Clear Editor"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={handleRun}
          disabled={isRunning}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            isRunning 
            ? 'bg-slate-700 text-slate-500' 
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
          }`}
        >
          {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          Run Code
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 overflow-auto bg-[#1e1e1e] relative group">
          <Editor
            value={code}
            onValueChange={newCode => {
              setCode(newCode);
              onCodeChange(newCode);
            }}
            highlight={code => highlight(code, getLanguagePrism())}
            padding={32}
            style={{
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: 16,
              minHeight: '100%',
              backgroundColor: 'transparent'
            }}
            className="outline-none"
          />
        </div>

        {/* Console / Output Area */}
        <div className="w-80 bg-[#1a1a1a] border-l border-white/5 flex flex-col">
          <div className="h-10 px-4 flex items-center gap-2 border-b border-white/5 bg-[#252526]">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Output</span>
          </div>
          <div className="flex-1 p-6 font-mono text-sm overflow-auto">
            {isRunning && (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">Executing...</span>
              </div>
            )}
            {!isRunning && !output && !error && (
              <p className="text-slate-700 italic">No output yet. Click 'Run' to execute.</p>
            )}
            {output && <pre className="text-emerald-400 whitespace-pre-wrap mb-4">{output}</pre>}
            {error && <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeIDE;
