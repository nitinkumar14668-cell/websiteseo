import React, { useState } from 'react';
import { Search, Activity, GitCompare, ChevronRight, AlertTriangle, CheckCircle, ShieldAlert, BarChart3, Globe } from 'lucide-react';
import { cn } from './lib/utils';
import { motion } from 'motion/react';

// --- Type Definitions ---
type SeoData = {
  rawMetrics: {
    title: string;
    metaDescription: string;
    h1Count: number;
    imgCount: number;
    imgWithoutAlt: number;
    loadTime: number;
  };
  aiAnalysis: {
    score: number;
    summary: string;
    strengths: string[];
    errors: {
      issue: string;
      impact: 'High' | 'Medium' | 'Low';
      solution: string;
    }[];
    estimatedRankingMetrics: {
      keywordDensity: string;
      contentQuality: string;
    };
  };
};

type RankingData = {
  rank: string;
  estimatedTraffic: string;
  difficulty: "High" | "Medium" | "Low";
  competitors: string[];
  summary: string;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'compare' | 'ranking'>('analyze');
  const [url, setUrl] = useState('');
  const [url2, setUrl2] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SeoData | null>(null);
  const [data2, setData2] = useState<SeoData | null>(null);
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setErrorMsg('');
    setData(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const result = await res.json();
      if (res.ok) {
        setData(result);
      } else {
        setErrorMsg(result.error || 'Failed to analyze website.');
      }
    } catch (err: any) {
      setErrorMsg('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !url2) return;
    setLoading(true);
    setErrorMsg('');
    setData(null);
    setData2(null);
    try {
      const [res1, res2] = await Promise.all([
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        }),
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url2 }),
        })
      ]);

      const result1 = await res1.json();
      const result2 = await res2.json();

      if (res1.ok && res2.ok) {
        setData(result1);
        setData2(result2);
      } else {
        setErrorMsg('Ek ya dono websites ka analysis fail ho gaya.');
      }
    } catch (err: any) {
      setErrorMsg('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleRanking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !keyword) return;
    setLoading(true);
    setErrorMsg('');
    setRankingData(null);
    try {
      const res = await fetch('/api/ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, keyword }),
      });
      const result = await res.json();
      if (res.ok) {
        setRankingData(result);
      } else {
        setErrorMsg(result.error || 'Failed to fetch ranking.');
      }
    } catch (err: any) {
      setErrorMsg('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 font-sans">
      {/* Header */}
      <header className="bg-[#0A0A0B] border-b border-slate-800/80 sticky top-0 z-10 antialiased">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Activity size={20} className="font-bold text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SEOFlux<span className="text-indigo-500 underline underline-offset-4 decoration-2">.AI</span></span>
          </div>
          <nav className="flex items-center gap-8 text-sm font-medium text-slate-400">
            <button
              onClick={() => { setActiveTab('analyze'); setData(null); setData2(null); setRankingData(null); setErrorMsg(''); }}
              className={cn(
                "pb-1 transition-colors border-b-2 text-sm font-bold tracking-wide",
                activeTab === 'analyze' ? "text-indigo-400 border-indigo-400" : "border-transparent hover:text-white text-slate-400"
              )}
            >
              Analyzer
            </button>
            <button
              onClick={() => { setActiveTab('compare'); setData(null); setData2(null); setRankingData(null); setErrorMsg(''); }}
              className={cn(
                "pb-1 transition-colors border-b-2 text-sm font-bold tracking-wide",
                activeTab === 'compare' ? "text-indigo-400 border-indigo-400" : "border-transparent hover:text-white text-slate-400"
              )}
            >
              1v1 Compare
            </button>
            <button
              onClick={() => { setActiveTab('ranking'); setData(null); setData2(null); setRankingData(null); setErrorMsg(''); }}
              className={cn(
                "pb-1 transition-colors border-b-2 text-sm font-bold tracking-wide",
                activeTab === 'ranking' ? "text-indigo-400 border-indigo-400" : "border-transparent hover:text-white text-slate-400"
              )}
            >
              Keyword Ranker
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white">
            {activeTab === 'analyze' && 'Website ka Live SEO Score Check Karein'}
            {activeTab === 'compare' && 'Donon Websites ko Compare Karein'}
            {activeTab === 'ranking' && 'Keyword Ranking Check Karein'}
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {activeTab === 'analyze' && 'AI powered tool se apne website ke SEO errors dhundhein aur free me fix karne ka solution paayein.'}
            {activeTab === 'compare' && 'Dono competitors ki SEO performance evaluate karein aur dekhen kaun aage hai.'}
            {activeTab === 'ranking' && 'Check karein ki aapka website kisi specific keyword ke liye kaisa rank kar raha hai.'}
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-3xl mx-auto bg-slate-900/50 p-6 rounded-2xl border border-slate-800 mb-12">
          {activeTab === 'analyze' ? (
            <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="url"
                  placeholder="Website URL enter karein (e.g. https://example.com)"
                  className="w-full pl-12 pr-4 py-3 bg-black border border-slate-700 rounded-xl text-sm text-indigo-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Analyze Now <ChevronRight size={16} /></>
                )}
              </button>
            </form>
          ) : activeTab === 'compare' ? (
            <form onSubmit={handleCompare} className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="url"
                    placeholder="First Website URL"
                    className="w-full pl-12 pr-4 py-3 bg-black border border-slate-700 rounded-xl text-sm text-indigo-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="hidden sm:flex items-center justify-center text-xs font-black text-slate-500 tracking-widest uppercase">VS</div>
                <div className="relative flex-grow">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input
                    type="url"
                    placeholder="Second Website URL"
                    className="w-full pl-12 pr-4 py-3 bg-black border border-slate-700 rounded-xl text-sm text-indigo-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                    value={url2}
                    onChange={(e) => setUrl2(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors w-full sm:w-auto self-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Compare Websites <GitCompare size={16} /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRanking} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="url"
                  placeholder="Website URL"
                  className="w-full pl-12 pr-4 py-3 bg-black border border-slate-700 rounded-xl text-sm text-indigo-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="Target Keyword"
                  className="w-full pl-12 pr-4 py-3 bg-black border border-slate-700 rounded-xl text-sm text-indigo-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Check Rank <ChevronRight size={16} /></>
                )}
              </button>
            </form>
          )}
        </div>

        {errorMsg && (
          <div className="max-w-3xl mx-auto bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-8 flex items-center gap-2 text-sm font-medium">
            <AlertTriangle size={18} />
            {errorMsg}
          </div>
        )}

        {/* Results Container */}
        {activeTab === 'analyze' && data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <SeoReport data={data} url={url} />
          </motion.div>
        )}

        {activeTab === 'compare' && data && data2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8 relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800 hidden md:block -translate-x-1/2" />
            <SeoReport data={data} url={url} compact />
            <SeoReport data={data2} url={url2} compact />
          </motion.div>
        )}

        {activeTab === 'ranking' && rankingData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400"></div>
              
              <h2 className="text-xl font-bold truncate text-white mb-1" title={url}>{new URL(url).hostname}</h2>
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-8">
                <Search size={14} className="text-indigo-400" />
                <span className="text-sm text-indigo-300 font-medium">"{keyword}"</span>
              </div>
              
              <div className="flex flex-col items-center justify-center mb-8 relative">
                <div className="w-32 h-32 rounded-full border-8 border-indigo-500/20 bg-indigo-500/5 flex items-center justify-center flex-col">
                  <span className="text-5xl font-black text-indigo-400">#{rankingData.rank}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4">Estimated Rank</span>
              </div>
              
              <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto bg-black/40 p-4 rounded-xl border border-slate-800 mb-6">
                {rankingData.summary}
              </p>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-black/40 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Difficulty</span>
                  <span className={cn("text-lg font-bold", rankingData.difficulty === 'High' ? "text-rose-400" : rankingData.difficulty === 'Medium' ? "text-amber-400" : "text-emerald-400")}>{rankingData.difficulty}</span>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Est. Traffic</span>
                  <span className="text-lg font-bold text-slate-200">{rankingData.estimatedTraffic}</span>
                </div>
              </div>

              <div className="mt-4 bg-black/40 p-4 rounded-xl border border-slate-800 text-left">
                 <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Top Competitors</span>
                 <ul className="space-y-2">
                   {rankingData.competitors.map((comp, idx) => (
                     <li key={idx} className="flex gap-2 items-center text-sm">
                       <span className="text-xs font-mono text-slate-500">{(idx + 1).toString().padStart(2, '0')}</span>
                       <span className="text-slate-300 truncate">{comp}</span>
                     </li>
                   ))}
                 </ul>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

// Sub-Component for Report
function SeoReport({ data, url, compact = false }: { data: SeoData, url: string, compact?: boolean }) {
  const { aiAnalysis, rawMetrics } = data;
  
  // Score color logic
  let scoreColor = "text-rose-500";
  let scoreBg = "bg-rose-500/5";
  let scoreBorder = "border-rose-500/20";
  if (aiAnalysis.score >= 80) {
    scoreColor = "text-emerald-500";
    scoreBg = "bg-emerald-500/5";
    scoreBorder = "border-emerald-500/20";
  } else if (aiAnalysis.score >= 50) {
    scoreColor = "text-amber-500";
    scoreBg = "bg-amber-500/5";
    scoreBorder = "border-amber-500/20";
  }

  return (
    <div className={cn("space-y-6", compact ? "" : "max-w-4xl mx-auto")}>
      {/* Title & Score Card */}
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
        <div className={cn("flex-shrink-0 w-32 h-32 rounded-full border-8 flex items-center justify-center flex-col", scoreBorder, scoreBg)}>
          <span className={cn("text-4xl font-black tracking-tighter", scoreColor)}>{aiAnalysis.score}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Score</span>
        </div>
        <div className="flex-grow space-y-2 text-center sm:text-left">
          <h2 className="text-xl font-bold truncate text-white" title={url}>{new URL(url).hostname}</h2>
          <p className="text-slate-400 leading-relaxed text-sm">{aiAnalysis.summary}</p>
        </div>
      </div>

      {/* Grid for Technicals & Strengths */}
      <div className={cn("grid gap-6", compact ? "grid-cols-1" : "md:grid-cols-2")}>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-indigo-400"/> Technical Metrics</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between items-center border-b border-slate-800/50 pb-2">
              <span className="text-slate-400">Page Title</span>
              <span className="font-medium text-white max-w-[200px] truncate" title={rawMetrics.title}>{rawMetrics.title || 'Missing'}</span>
            </li>
            <li className="flex justify-between items-center border-b border-slate-800/50 pb-2">
              <span className="text-slate-400">H1 Tags</span>
              <span className={cn("font-medium", rawMetrics.h1Count !== 1 ? "text-rose-400" : "text-white")}>{rawMetrics.h1Count}</span>
            </li>
            <li className="flex justify-between items-center border-b border-slate-800/50 pb-2">
              <span className="text-slate-400">Images without Alt</span>
              <span className={cn("font-medium", rawMetrics.imgWithoutAlt > 0 ? "text-amber-400" : "text-emerald-400")}>
                {rawMetrics.imgWithoutAlt} / {rawMetrics.imgCount}
              </span>
            </li>
            <li className="flex justify-between items-center pb-2">
              <span className="text-slate-400">Ranking Estimation</span>
              <div className="text-right">
                <div className="text-[11px] text-slate-500">Keyword: <span className="font-semibold capitalize text-white">{aiAnalysis.estimatedRankingMetrics.keywordDensity}</span></div>
                <div className="text-[11px] text-slate-500">Content: <span className="font-semibold capitalize text-white">{aiAnalysis.estimatedRankingMetrics.contentQuality}</span></div>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2"><CheckCircle size={16} className="text-emerald-400"/> Strengths</h3>
          <ul className="space-y-3 text-sm">
            {aiAnalysis.strengths.map((strength, idx) => (
              <li key={idx} className="flex gap-2 items-start border-b border-slate-800/30 pb-2 last:border-0 last:pb-0">
                 <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0"/>
                 <span className="text-slate-300 leading-relaxed text-[13px]">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Errors & Solutions */}
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
            <ShieldAlert size={16} className="text-rose-500"/> SEO Errors & Fixes
          </h3>
          {aiAnalysis.errors.length > 0 && <span className="px-2 py-1 bg-rose-500/10 text-rose-500 text-[10px] rounded-full font-bold">{aiAnalysis.errors.length < 10 ? `0${aiAnalysis.errors.length}` : aiAnalysis.errors.length} FOUND</span>}
        </div>
        
        {aiAnalysis.errors.length === 0 ? (
          <p className="text-emerald-400 text-sm font-medium p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">Bohot badhiya! Koi badi error nahi mili.</p>
        ) : (
          <ul className="space-y-3 mt-4">
            {aiAnalysis.errors.map((err, idx) => (
              <li key={idx} className={cn(
                "flex items-start gap-4 p-4 rounded-xl border",
                err.impact === 'High' ? "bg-rose-500/5 border-rose-500/10" : err.impact === 'Medium' ? "bg-amber-500/5 border-amber-500/10" : "bg-indigo-500/5 border-indigo-500/10"
              )}>
                <div className={cn("mt-1 font-mono text-xs font-bold shrink-0", 
                  err.impact === 'High' ? "text-rose-500" : err.impact === 'Medium' ? "text-amber-500" : "text-indigo-400"
                )}>
                  {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                </div>
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-white">{err.issue}</p>
                  </div>
                  <div className="mt-3 p-3 bg-black/40 border border-slate-800 rounded-lg">
                    <strong className={cn("block text-[10px] uppercase font-bold mb-1 tracking-widest", err.impact === 'High' ? "text-rose-400" : err.impact === 'Medium' ? "text-amber-400" : "text-indigo-400")}>Fix Solution:</strong>
                    <span className="text-[12px] text-slate-300 leading-relaxed">{err.solution}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
