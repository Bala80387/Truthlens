import React, { useState, useEffect, useRef } from 'react';
import { User, Heart, MessageCircle, Share2, ShieldAlert, CheckCircle, AlertTriangle, Send, X, MoreHorizontal, Shield, Lock, Eye, ScanLine, Zap, Activity, Search, Brain, Fingerprint, ScanEye, Wand2, Terminal, AlertOctagon, Network, Globe } from 'lucide-react';
import { analyzeContent } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Post {
  id: number;
  author: string;
  handle: string;
  avatarColor: string;
  content: string;
  time: string;
  likes: number;
  comments: number;
  status: 'Real' | 'Fake' | 'Misleading' | 'Satire' | 'Unverified';
  aiConfidence?: number;
  // X-Ray Metadata
  originNode?: string;
  botProb?: number;
  propagationRate?: string;
  networkCluster?: string;
}

const MOCK_NARRATIVE_DNA = [
    { subject: 'Fear', A: 0, fullMark: 100 },
    { subject: 'Logic', A: 100, fullMark: 100 },
    { subject: 'Bias', A: 0, fullMark: 100 },
    { subject: 'Virality', A: 20, fullMark: 100 },
    { subject: 'Urgency', A: 10, fullMark: 100 },
];

export const SocialShield: React.FC = () => {
  const [draft, setDraft] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [warning, setWarning] = useState<AnalysisResult | null>(null);
  const [xRayMode, setXRayMode] = useState(false);
  const [narrativeDNA, setNarrativeDNA] = useState(MOCK_NARRATIVE_DNA);
  
  // Feed State
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: 'Tech Insider',
      handle: '@tech_insider',
      avatarColor: 'bg-blue-500',
      content: 'Major breakthrough: Scientists successfully teleport a single photon over 500km using quantum entanglement network. #QuantumPhysics #Science',
      time: '2h ago',
      likes: 1240,
      comments: 85,
      status: 'Real',
      aiConfidence: 98,
      originNode: 'MIT_Edu_Relay_04',
      botProb: 2,
      propagationRate: 'Normal',
      networkCluster: 'Academic/Tech'
    },
    {
      id: 2,
      author: 'Daily Viral',
      handle: '@daily_viral',
      avatarColor: 'bg-purple-500',
      content: 'Govt announces mandatory microchip implants for all citizens by 2026 to track carbon footprint! 😱 Share before they delete this!',
      time: '4h ago',
      likes: 856,
      comments: 420,
      status: 'Fake',
      aiConfidence: 95,
      originNode: 'Unknown_Proxy_VN',
      botProb: 89,
      propagationRate: 'Viral/Spike',
      networkCluster: 'Disinfo_Botnet_B'
    }
  ]);

  // Deep Scan State
  const [scanningPostId, setScanningPostId] = useState<number | null>(null);
  const [scannedResults, setScannedResults] = useState<Record<number, AnalysisResult>>({});

  // Real-time Draft Safety Score
  const [safetyScore, setSafetyScore] = useState(100);

  // Simulation Nodes for Graph
  const [simNodes, setSimNodes] = useState<{x: number, y: number, active: boolean, delay: number}[]>([]);

  // Init Simulation Grid
  useEffect(() => {
      const nodes = [];
      for(let i=0; i<30; i++) {
          nodes.push({
              x: Math.random() * 100,
              y: Math.random() * 100,
              active: false,
              delay: Math.random() * 2000
          });
      }
      setSimNodes(nodes);
  }, []);

  // Simulate typing analysis & Narrative DNA updates
  useEffect(() => {
    if (draft.length > 5) {
        setIsScanning(true);
        // Heuristic analysis for demo visualizer
        const riskKeywords = ['shocking', 'secret', 'banned', 'leak', 'guaranteed', '100%', 'urgent', 'alert', 'they'];
        const logicKeywords = ['study', 'report', 'evidence', 'according', 'data', 'analysis'];
        
        const fearCount = riskKeywords.filter(w => draft.toLowerCase().includes(w)).length;
        const logicCount = logicKeywords.filter(w => draft.toLowerCase().includes(w)).length;
        
        // Update DNA
        const newDNA = [
            { subject: 'Fear', A: Math.min(100, fearCount * 25 + (draft.includes('!') ? 20 : 0)), fullMark: 100 },
            { subject: 'Logic', A: Math.max(10, Math.min(100, logicCount * 20)), fullMark: 100 },
            { subject: 'Bias', A: Math.min(100, fearCount * 15 + (draft.length > 50 ? 20 : 0)), fullMark: 100 },
            { subject: 'Virality', A: Math.min(100, (fearCount + logicCount) * 15 + (draft.length > 20 ? 30 : 0)), fullMark: 100 },
            { subject: 'Urgency', A: Math.min(100, (draft.includes('now') || draft.includes('!')) ? 80 : 20), fullMark: 100 },
        ];
        setNarrativeDNA(newDNA);

        // Safety Score
        setSafetyScore(Math.max(20, 100 - (fearCount * 15) - (draft.length > 200 ? 10 : 0)));
        
        const timer = setInterval(() => {
            setScanProgress(prev => Math.min(prev + 10, 100));
        }, 50);
        return () => clearInterval(timer);
    } else {
        setScanProgress(0);
        setIsScanning(false);
        setSafetyScore(100);
        setNarrativeDNA(MOCK_NARRATIVE_DNA);
    }
  }, [draft]);

  const handlePost = async () => {
    if (!draft.trim()) return;

    setIsScanning(true);
    setScanProgress(100);
    
    // Simulate network delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const type = draft.includes('http') ? 'url' : 'text';
      const result = await analyzeContent(draft, type);
      
      if (result.classification === 'Real' || result.classification === 'Unverified') {
        addPost(draft, result.classification, result.confidence);
      } else {
        setWarning(result);
      }
    } catch (e) {
      console.error(e);
      addPost(draft, 'Unverified', 0);
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const addPost = (text: string, status: any, confidence: number) => {
    const newPost: Post = {
      id: Date.now(),
      author: 'You',
      handle: '@current_user',
      avatarColor: 'bg-primary-500',
      content: text,
      time: 'Just now',
      likes: 0,
      comments: 0,
      status: status,
      aiConfidence: confidence,
      originNode: 'Local_Client_US',
      botProb: 0,
      propagationRate: 'Low',
      networkCluster: 'Organic'
    };
    setPosts([newPost, ...posts]);
    setDraft('');
    setSafetyScore(100);
  };

  const handleDeepScan = async (postId: number, content: string) => {
      if (scannedResults[postId]) return; // Already scanned

      setScanningPostId(postId);
      try {
          // Simulate scan delay
          await new Promise(r => setTimeout(r, 1500));
          const result = await analyzeContent(content, 'text');
          setScannedResults(prev => ({...prev, [postId]: result}));
      } catch (e) {
          console.error("Deep scan failed", e);
      } finally {
          setScanningPostId(null);
      }
  };

  const confirmPostAnyway = () => {
    if (warning) {
      addPost(draft, warning.classification, warning.confidence);
      setWarning(null);
    }
  };

  const handleSanitize = () => {
      // Simulate AI rewriting the draft to be neutral
      const words = draft.split(' ');
      const sanitized = words.map(w => {
          if (['shocking', 'secret', 'banned', 'leak', 'guaranteed'].includes(w.toLowerCase())) return '[REDACTED]';
          return w;
      }).join(' ');
      setDraft(`[AI EDITED] The following claim requires verification: ${sanitized}`);
      setWarning(null);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in relative pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-3xl font-black text-white mb-1 flex items-center tracking-tighter">
                <Shield className="w-8 h-8 mr-3 text-primary-500" />
                SOCIAL_SENTINEL <span className="text-xs align-top ml-1 text-primary-500">v3.0</span>
            </h2>
            <p className="text-slate-400 font-mono text-xs">
              ACTIVE PROTECTION LAYER // <span className="text-green-400">ONLINE</span>
            </p>
        </div>
        
        <div className="flex items-center space-x-4">
             {/* X-Ray Toggle */}
            <button 
                onClick={() => setXRayMode(!xRayMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${
                    xRayMode 
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                    : 'bg-black/40 border-slate-700 text-slate-500 hover:border-slate-500'
                }`}
            >
                <ScanEye className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{xRayMode ? 'X-Ray Active' : 'X-Ray Vision'}</span>
            </button>
            
            <div className="h-8 w-px bg-white/10"></div>

            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                <Eye className="w-4 h-4 text-primary-400" />
                <span className="text-xs font-bold text-slate-300">Monitoring Stream</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile/Stats (3 cols) */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
           {/* User Card */}
           <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-purple-500"></div>
              <div className="flex flex-col items-center relative z-10">
                 <div className="w-24 h-24 rounded-full p-[2px] bg-gradient-to-tr from-primary-500 to-purple-500 mb-4 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                        <User className="w-12 h-12 text-slate-300" />
                    </div>
                 </div>
                 <h3 className="text-white font-bold text-lg">@truth_seeker</h3>
                 <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-slate-300 uppercase tracking-wider mt-1 border border-white/5">Verified Human</span>
              </div>
              <div className="mt-6 space-y-4">
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Digital Trust Score</span>
                        <span className="text-green-400 font-bold">98/100</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-green-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{width: '98%'}}></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Network Impact</span>
                        <span className="text-purple-400 font-bold">High</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-purple-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{width: '85%'}}></div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Active Modules */}
           <div className="glass-panel p-6 rounded-2xl border-white/5 bg-gradient-to-br from-primary-900/10 to-transparent">
              <div className="flex items-center space-x-2 mb-3 text-primary-400">
                 <Zap className="w-5 h-5" />
                 <span className="font-bold text-sm">Active Scanners</span>
              </div>
              <div className="space-y-2">
                 {['Semantic Analysis', 'Image Forensics', 'Source Verification', 'Botnet Detection'].map((scan, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-400">
                        <span>{scan}</span>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Center Column: Feed (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
           {/* Post Creator */}
           <div className="glass-panel p-1 rounded-2xl border-white/10 relative z-10 bg-gradient-to-b from-white/10 to-transparent">
              <div className="bg-black/80 rounded-xl p-4 backdrop-blur-xl">
                <div className="flex space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 flex-shrink-0"></div>
                    <div className="flex-1 relative">
                        <textarea 
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Draft new post (Real-time analysis active)..."
                            className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-slate-600 resize-none h-24 text-lg font-light"
                        />
                        
                        {/* Scanning Overlay */}
                        {isScanning && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                                <div className="absolute inset-0 bg-primary-500/5"></div>
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-primary-400 shadow-[0_0_15px_rgba(56,189,248,0.8)] animate-[scan_2s_linear_infinite]"></div>
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-2">
                            <div className="flex space-x-2 text-primary-500">
                                <button className="p-2 hover:bg-white/5 rounded-full transition-colors"><Share2 className="w-5 h-5" /></button>
                                <button className="p-2 hover:bg-white/5 rounded-full transition-colors"><ShieldAlert className="w-5 h-5" /></button>
                            </div>
                            <div className="flex items-center space-x-3">
                                {isScanning ? (
                                    <span className="text-xs text-primary-400 font-mono animate-pulse">
                                        ANALYZING {scanProgress}%
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ready</span>
                                )}
                                <button 
                                    onClick={handlePost}
                                    disabled={!draft.trim() || (isScanning && scanProgress < 100)}
                                    className="px-6 py-2 rounded-full bg-white text-black font-bold hover:bg-slate-200 transition-all disabled:opacity-50 disabled:hover:bg-white flex items-center space-x-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                >
                                    <Send className="w-4 h-4" />
                                    <span>Post</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
           </div>

           {/* Feed Items */}
           <div className="space-y-4">
              {posts.map(post => {
                  const result = scannedResults[post.id];
                  return (
                     <div key={post.id} className="glass-panel p-6 rounded-2xl border-white/5 animate-fade-in hover:border-white/10 transition-colors group relative overflow-hidden">
                        {scanningPostId === post.id && (
                             <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in">
                                 <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                 <span className="text-xs text-primary-400 font-mono animate-pulse">RUNNING DEEP PACKET INSPECTION...</span>
                             </div>
                        )}

                        {/* X-Ray Overlay Layer */}
                        {xRayMode && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 p-6 flex flex-col justify-center animate-fade-in">
                                <div className="flex items-center space-x-2 mb-4 text-purple-400 border-b border-purple-500/30 pb-2">
                                    <ScanEye className="w-5 h-5" />
                                    <span className="font-bold text-sm tracking-wider">X-RAY METADATA LAYER</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                                    <div className="bg-purple-900/20 p-2 rounded border border-purple-500/20">
                                        <span className="block text-purple-500 opacity-70">ORIGIN NODE</span>
                                        <span className="text-white">{post.originNode || 'N/A'}</span>
                                    </div>
                                    <div className="bg-purple-900/20 p-2 rounded border border-purple-500/20">
                                        <span className="block text-purple-500 opacity-70">BOT PROBABILITY</span>
                                        <span className={`font-bold ${post.botProb && post.botProb > 50 ? 'text-red-400' : 'text-green-400'}`}>
                                            {post.botProb}%
                                        </span>
                                    </div>
                                    <div className="bg-purple-900/20 p-2 rounded border border-purple-500/20">
                                        <span className="block text-purple-500 opacity-70">PROPAGATION</span>
                                        <span className="text-white">{post.propagationRate || 'N/A'}</span>
                                    </div>
                                    <div className="bg-purple-900/20 p-2 rounded border border-purple-500/20">
                                        <span className="block text-purple-500 opacity-70">NETWORK CLUSTER</span>
                                        <span className="text-white">{post.networkCluster || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-3 relative z-0">
                           <div className="flex space-x-3">
                              <div className={`w-10 h-10 rounded-full ${post.avatarColor} flex items-center justify-center shadow-lg`}>
                                  <span className="font-bold text-white text-xs">{post.author[0]}</span>
                              </div>
                              <div>
                                 <div className="flex items-center space-x-2">
                                    <span className="text-white font-bold hover:underline cursor-pointer">{post.author}</span>
                                    <span className="text-slate-500 text-sm">{post.handle}</span>
                                    <span className="text-slate-600 text-xs">• {post.time}</span>
                                 </div>
                                 {post.status === 'Real' && (
                                    <div className="flex items-center space-x-1 mt-1">
                                        <Shield className="w-3 h-3 text-green-500" />
                                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Verified Safe</span>
                                    </div>
                                 )}
                                 {(post.status === 'Fake' || post.status === 'Misleading') && (
                                    <div className="flex items-center space-x-1 mt-1">
                                        <AlertTriangle className="w-3 h-3 text-red-500" />
                                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Flagged: {post.status}</span>
                                    </div>
                                 )}
                              </div>
                           </div>
                           <button className="text-slate-600 hover:text-white transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                        </div>
                        
                        <p className="text-slate-200 mb-4 whitespace-pre-wrap leading-relaxed text-[15px] relative z-0">{post.content}</p>
                        
                        {/* Deep Scan Result Expansion */}
                        {result && (
                            <div className="mb-4 bg-black/40 rounded-xl border border-white/5 p-4 animate-fade-in relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-bold text-primary-400 uppercase tracking-wider flex items-center">
                                        <ScanLine className="w-3 h-3 mr-2" /> Diagnostic Report
                                    </h4>
                                    <span className="text-[10px] text-slate-500">{result.classification.toUpperCase()}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <p className="text-xs text-slate-300 leading-relaxed mb-2">{result.summary}</p>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-lg text-center">
                                        <span className="block text-[10px] text-slate-500 uppercase">Truth Probability</span>
                                        <span className={`text-lg font-bold ${result.confidence > 70 ? 'text-green-400' : 'text-red-400'}`}>{result.confidence}%</span>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-lg text-center">
                                        <span className="block text-[10px] text-slate-500 uppercase">Bot Likelihood</span>
                                        <span className={`text-lg font-bold ${result.isAiGenerated ? 'text-red-400' : 'text-green-400'}`}>{result.isAiGenerated ? 'High' : 'Low'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-slate-500 pt-3 border-t border-white/5 relative z-0">
                           <div className="flex space-x-6">
                               <button className="flex items-center space-x-2 hover:text-primary-400 transition-colors group-hover:text-slate-400">
                                  <MessageCircle className="w-4 h-4" />
                                  <span className="text-xs font-medium">{post.comments}</span>
                               </button>
                               <button className="flex items-center space-x-2 hover:text-red-400 transition-colors group-hover:text-slate-400">
                                  <Heart className="w-4 h-4" />
                                  <span className="text-xs font-medium">{post.likes}</span>
                               </button>
                               <button className="flex items-center space-x-2 hover:text-green-400 transition-colors group-hover:text-slate-400">
                                  <Share2 className="w-4 h-4" />
                                  <span className="text-xs font-medium">Share</span>
                               </button>
                           </div>
                           
                           {!result && (
                               <button 
                                  onClick={() => handleDeepScan(post.id, post.content)}
                                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-primary-400 transition-all border border-transparent hover:border-primary-500/30"
                               >
                                  <Search className="w-3 h-3" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">Deep Scan</span>
                               </button>
                           )}
                        </div>
                     </div>
                  );
              })}
           </div>
        </div>

        {/* Right Column: Real-time Analysis (3 cols) */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
            
            {/* Narrative DNA Radar */}
            <div className="glass-panel p-6 rounded-2xl border-white/5">
                <div className="flex items-center space-x-2 mb-2">
                    <Fingerprint className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-white text-sm">Narrative DNA</h3>
                </div>
                <p className="text-[10px] text-slate-400 mb-4">Real-time draft psychographics.</p>
                
                <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={narrativeDNA}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="DNA" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                    {isScanning && (
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div className="w-full h-full border-2 border-purple-500/10 rounded-full animate-ping"></div>
                         </div>
                    )}
                </div>
            </div>

            {/* Keyword Monitor */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 bg-black/40">
                <div className="flex items-center space-x-2 mb-4">
                    <Terminal className="w-4 h-4 text-green-400" />
                    <h3 className="font-bold text-white text-sm font-mono">KEYWORD_MONITOR</h3>
                </div>
                <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Emotional Load</span>
                        <div className="flex space-x-1">
                            {Array.from({length: 5}).map((_, i) => (
                                <div key={i} className={`w-1.5 h-3 rounded-sm ${i < (narrativeDNA[0].A / 20) ? 'bg-red-500' : 'bg-slate-800'}`}></div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Logic Density</span>
                        <div className="flex space-x-1">
                            {Array.from({length: 5}).map((_, i) => (
                                <div key={i} className={`w-1.5 h-3 rounded-sm ${i < (narrativeDNA[1].A / 20) ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Viral Propagation Simulator (Enhanced AI Guardian) */}
            <div className="glass-panel p-6 rounded-2xl border-white/5 bg-black overflow-hidden relative group">
                <div className={`absolute inset-0 opacity-20 pointer-events-none transition-colors duration-1000 ${safetyScore < 60 ? 'bg-red-900' : 'bg-blue-900'}`}></div>
                <div className="flex items-center space-x-2 mb-3 relative z-10">
                    <Globe className={`w-5 h-5 ${safetyScore < 60 ? 'text-red-400' : 'text-blue-400'}`} />
                    <h3 className="font-bold text-white text-sm">Viral Simulator</h3>
                </div>
                <p className="text-xs text-slate-400 mb-3 relative z-10">Predicted propagation across network.</p>
                
                <div className="h-40 w-full bg-black/50 rounded-lg border border-white/10 relative overflow-hidden">
                    <svg className="w-full h-full">
                        {simNodes.map((node, i) => (
                            <circle 
                                key={i} 
                                cx={`${node.x}%`} 
                                cy={`${node.y}%`} 
                                r={isScanning ? (safetyScore < 60 ? 3 : 2) : 1}
                                fill={isScanning && safetyScore < 60 ? '#ef4444' : isScanning ? '#3b82f6' : '#475569'}
                                opacity={isScanning ? 0.8 : 0.3}
                                className="transition-all duration-500"
                            >
                                {isScanning && (
                                    <animate 
                                        attributeName="r" 
                                        values={safetyScore < 60 ? "3;6;3" : "2;4;2"} 
                                        dur={`${1 + Math.random()}s`} 
                                        repeatCount="indefinite" 
                                    />
                                )}
                            </circle>
                        ))}
                    </svg>
                    {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className={`text-2xl font-black ${safetyScore < 60 ? 'text-red-500' : 'text-blue-500'} opacity-50`}>
                                {safetyScore < 60 ? 'VIRAL' : 'SAFE'}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center mt-3 text-[10px] font-mono relative z-10">
                    <span className="text-slate-500">REACH EST.</span>
                    <span className={`font-bold ${safetyScore < 60 ? 'text-red-400' : 'text-green-400'}`}>
                        {safetyScore < 60 ? '2.4M (HIGH)' : '15k (LOW)'}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* Futuristic Intervention Modal */}
      {warning && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setWarning(null)}></div>
            <div className="relative z-10 w-full max-w-lg bg-black border border-red-500/50 shadow-[0_0_100px_rgba(220,38,38,0.3)] rounded-3xl overflow-hidden animate-fade-in scale-100 ring-1 ring-red-500/50">
               
               {/* Header Pattern */}
               <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

               <div className="p-8 relative">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center space-x-3">
                         <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30">
                            <ShieldAlert className="w-8 h-8 text-red-500" />
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-white tracking-tight">SECURITY INTERVENTION</h3>
                            <p className="text-xs text-red-400 font-mono">THREAT DETECTED IN OUTBOUND TRAFFIC</p>
                         </div>
                     </div>
                     <div className="text-right">
                         <span className="block text-3xl font-black text-red-500">{warning.classification.toUpperCase()}</span>
                         <span className="text-[10px] text-slate-500 uppercase tracking-widest">Confidence: {warning.confidence}%</span>
                     </div>
                  </div>

                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Analysis Summary</h4>
                     <p className="text-slate-200 text-sm leading-relaxed">{warning.summary}</p>
                  </div>

                  <div className="space-y-3 mb-8">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Factors</h4>
                     {warning.reasoning.slice(0, 3).map((reason, i) => (
                        <div key={i} className="flex items-start space-x-3 text-sm text-slate-300 p-2 rounded hover:bg-white/5 transition-colors">
                           <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                           <span>{reason}</span>
                        </div>
                     ))}
                  </div>

                  <div className="flex items-center gap-4">
                     <button 
                        onClick={handleSanitize}
                        className="flex-1 py-4 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                     >
                        <Wand2 className="w-4 h-4" />
                        <span>AI Sanitize</span>
                     </button>
                     <button 
                        onClick={confirmPostAnyway}
                        className="flex-1 py-4 rounded-xl border border-red-500/30 text-red-500 font-bold hover:bg-red-950/30 transition-all flex items-center justify-center space-x-2 group"
                     >
                        <Lock className="w-4 h-4 group-hover:text-red-400" />
                        <span>Proceed Anyway</span>
                     </button>
                  </div>
                  
                  <div className="mt-6 text-center">
                     <p className="text-[10px] text-slate-600">
                        Proceeding may flag your account for network review.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};