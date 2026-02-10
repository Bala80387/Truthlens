import React, { useState } from 'react';
import { User, Heart, MessageCircle, Share2, ShieldAlert, CheckCircle, AlertTriangle, Send, X, MoreHorizontal, Shield, Lock } from 'lucide-react';
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

  const handlePost = async () => {
    if (!draft.trim()) return;

    setIsScanning(true);
    
    // Simulate network delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Determine type based on content
      const type = draft.includes('http') ? 'url' : 'text';
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
    <div className="max-w-4xl mx-auto animate-fade-in relative">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Social Media Shield</h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Simulation Mode. Experience how TruthLens acts as a browser extension to intercept and analyze content before you share it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile/Stats */}
        <div className="hidden md:block space-y-4">
           <div className="glass-panel p-6 rounded-2xl border-white/5">
              <div className="flex flex-col items-center">
                 <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 p-1 mb-4">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                        <User className="w-10 h-10 text-slate-300" />
                    </div>
                 </div>
                 <h3 className="text-white font-bold text-lg">Current User</h3>
                 <p className="text-slate-500 text-sm">@truth_seeker</p>
              </div>
              <div className="mt-6 space-y-3">
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Trust Score</span>
                    <span className="text-green-400 font-bold">98/100</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{width: '98%'}}></div>
                 </div>
              </div>
           </div>

           <div className="glass-panel p-6 rounded-2xl border-white/5 bg-primary-500/5">
              <div className="flex items-center space-x-2 mb-2 text-primary-400">
                 <Shield className="w-5 h-5" />
                 <span className="font-bold">Protection Active</span>
              </div>
              <p className="text-xs text-slate-400">
                 All outgoing posts are being scanned by the Gemini cognitive engine in real-time.
              </p>
           </div>
        </div>

        {/* Center Column: Feed */}
        <div className="md:col-span-2 space-y-6">
           {/* Post Creator */}
           <div className="glass-panel p-4 rounded-2xl border-white/10 relative z-10">
              <div className="flex space-x-4">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 flex-shrink-0"></div>
                 <div className="flex-1">
                    <textarea 
                       value={draft}
                       onChange={(e) => setDraft(e.target.value)}
                       placeholder="What's happening? (Try pasting a fake news headline...)"
                       className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-slate-500 resize-none h-24 text-lg"
                    />
                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                       <div className="flex space-x-2 text-primary-500">
                          <button className="p-2 hover:bg-white/5 rounded-full"><Share2 className="w-5 h-5" /></button>
                          <button className="p-2 hover:bg-white/5 rounded-full"><AlertTriangle className="w-5 h-5" /></button>
                       </div>
                       <button 
                         onClick={handlePost}
                         disabled={!draft.trim() || isScanning}
                         className="px-6 py-2 rounded-full bg-primary-600 text-white font-bold hover:bg-primary-500 transition-colors disabled:opacity-50 flex items-center space-x-2"
                       >
                         {isScanning ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Scanning</span>
                            </>
                         ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Post</span>
                            </>
                         )}
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           {/* Feed Items */}
           <div className="space-y-4">
              {posts.map(post => (
                 <div key={post.id} className="glass-panel p-6 rounded-2xl border-white/5 animate-fade-in">
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex space-x-3">
                          <div className={`w-10 h-10 rounded-full ${post.avatarColor}`}></div>
                          <div>
                             <div className="flex items-center space-x-2">
                                <span className="text-white font-bold">{post.author}</span>
                                <span className="text-slate-500 text-sm">{post.handle}</span>
                                <span className="text-slate-500 text-sm">• {post.time}</span>
                             </div>
                             {post.status === 'Real' && (
                                <span className="inline-flex items-center space-x-1 bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border border-green-500/20">
                                   <CheckCircle className="w-3 h-3" /> <span>Verified Safe</span>
                                </span>
                             )}
                             {(post.status === 'Fake' || post.status === 'Misleading') && (
                                <span className="inline-flex items-center space-x-1 bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border border-red-500/20">
                                   <AlertTriangle className="w-3 h-3" /> <span>Flagged as {post.status}</span>
                                </span>
                             )}
                          </div>
                       </div>
                       <button className="text-slate-500 hover:text-white"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                    
                    <p className="text-slate-200 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    
                    <div className="flex items-center justify-between text-slate-500 pt-3 border-t border-white/5">
                       <button className="flex items-center space-x-2 hover:text-primary-400 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm">{post.comments}</span>
                       </button>
                       <button className="flex items-center space-x-2 hover:text-red-400 transition-colors">
                          <Heart className="w-5 h-5" />
                          <span className="text-sm">{post.likes}</span>
                       </button>
                       <button className="flex items-center space-x-2 hover:text-green-400 transition-colors">
                          <Share2 className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Intervention Modal */}
      {warning && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setWarning(null)}></div>
            <div className="relative z-10 w-full max-w-lg bg-black border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)] rounded-3xl overflow-hidden animate-fade-in">
               <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-full">
                     <ShieldAlert className="w-8 h-8 text-white" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-white">INTERVENTION</h3>
                     <p className="text-red-100">TruthLens Shield has flagged your content</p>
                  </div>
               </div>

               <div className="p-8">
                  <div className="mb-6">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Detected Classification</span>
                     <p className="text-3xl font-black text-red-500 mt-1">{warning.classification.toUpperCase()}</p>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-xl border border-white/10 mb-6">
                     <p className="text-slate-300 text-sm leading-relaxed">{warning.summary}</p>
                  </div>

                  <div className="space-y-2 mb-8">
                     {warning.reasoning.slice(0, 2).map((reason, i) => (
                        <div key={i} className="flex items-start space-x-2 text-sm text-slate-400">
                           <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                           <span>{reason}</span>
                        </div>
                     ))}
                  </div>

                  <div className="flex items-center gap-3">
                     <button 
                        onClick={() => setWarning(null)}
                        className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
                     >
                        <X className="w-4 h-4" />
                        <span>Cancel Post</span>
                     </button>
                     <button 
                        onClick={confirmPostAnyway}
                        className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-500 font-bold hover:bg-red-500/10 transition-colors"
                     >
                        Share Anyway
                     </button>
                  </div>
                  
                  <p className="text-center text-xs text-slate-600 mt-4">
                     Sharing verified misinformation may reduce your account visibility.
                  </p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
