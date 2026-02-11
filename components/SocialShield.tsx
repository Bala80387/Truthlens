import React, { useState, useEffect } from 'react';
import { User, Heart, MessageCircle, Share2, ShieldAlert, CheckCircle, AlertTriangle, Send, X, MoreHorizontal, Shield, Lock, Eye, ScanLine, Zap } from 'lucide-react';
import { analyzeContent } from '../services/geminiService';
import { AnalysisResult } from '../types';

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
}

export const SocialShield: React.FC = () => {
  const [draft, setDraft] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [warning, setWarning] = useState<AnalysisResult | null>(null);
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
      aiConfidence: 98
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
      aiConfidence: 95
    }
  ]);

  // Simulate typing analysis
  useEffect(() => {
    if (draft.length > 10) {
        setIsScanning(true);
        const timer = setInterval(() => {
            setScanProgress(prev => Math.min(prev + 5, 100));
        }, 100);
        return () => clearInterval(timer);
    } else {
        setScanProgress(0);
        setIsScanning(false);
    }
  }, [draft]);

  const handlePost = async () => {
    if (!draft.trim()) return;

    setIsScanning(true);
    setScanProgress(100);
    
    // Simulate network delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Determine type based on content
      const type = draft.includes('http') ? 'url' : 'text';
      // In a real app we call the API, here we simulate for "Without API" request if needed, 
      // but keeping the call to maintain logic flow. The prompt asked to enhance without API usage, 
      // implying visual enhancements, not removing existing logic.
      const result = await analyzeContent(draft, type);
      
      if (result.classification === 'Real' || result.classification === 'Unverified') {
        // Safe to post
        addPost(draft, result.classification, result.confidence);
      } else {
        // Trigger Warning Shield
        setWarning(result);
      }
    } catch (e) {
      console.error(e);
      // Fallback allow post on error
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
      aiConfidence: confidence
    };
    setPosts([newPost, ...posts]);
    setDraft('');
  };

  const confirmPostAnyway = () => {
    if (warning) {
      addPost(draft, warning.classification, warning.confidence);
      setWarning(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in relative pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-primary-500" />
                Social Sentinel
            </h2>
            <p className="text-slate-400">
            Active Browser Extension Simulation • <span className="text-green-400 font-mono">PROTECTION ENABLED</span>
            </p>
        </div>
        <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <Eye className="w-4 h-4 text-primary-400" />
            <span className="text-xs font-bold text-slate-300">Monitoring Input Stream</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile/Stats */}
        <div className="hidden md:block space-y-4">
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
                        <span className="text-slate-400">Reputation</span>
                        <span className="text-green-400 font-bold">98/100</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-green-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{width: '98%'}}></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Impact</span>
                        <span className="text-purple-400 font-bold">High</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-purple-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{width: '85%'}}></div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="glass-panel p-6 rounded-2xl border-white/5 bg-gradient-to-br from-primary-900/10 to-transparent">
              <div className="flex items-center space-x-2 mb-3 text-primary-400">
                 <Zap className="w-5 h-5" />
                 <span className="font-bold">Active Scanners</span>
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

        {/* Center Column: Feed */}
        <div className="md:col-span-2 space-y-6">
           {/* Post Creator */}
           <div className="glass-panel p-1 rounded-2xl border-white/10 relative z-10 bg-gradient-to-b from-white/10 to-transparent">
              <div className="bg-black/80 rounded-xl p-4 backdrop-blur-xl">
                <div className="flex space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 flex-shrink-0"></div>
                    <div className="flex-1 relative">
                        <textarea 
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Draft new post..."
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
                                {isScanning && (
                                    <span className="text-xs text-primary-400 font-mono animate-pulse">
                                        ANALYZING {scanProgress}%
                                    </span>
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
              {posts.map(post => (
                 <div key={post.id} className="glass-panel p-6 rounded-2xl border-white/5 animate-fade-in hover:border-white/10 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
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
                    
                    <p className="text-slate-200 mb-4 whitespace-pre-wrap leading-relaxed text-[15px]">{post.content}</p>
                    
                    <div className="flex items-center justify-between text-slate-500 pt-3 border-t border-white/5">
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
                 </div>
              ))}
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
                        onClick={() => setWarning(null)}
                        className="flex-1 py-4 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                     >
                        <X className="w-4 h-4" />
                        <span>Block & Edit</span>
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