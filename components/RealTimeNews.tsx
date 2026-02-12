import React, { useState, useEffect, useRef } from 'react';
import { NewsItem, Classification } from '../types';
import { Search, Filter, RefreshCw, Zap, TrendingUp, AlertTriangle, CheckCircle, Clock, Globe, Shield, Terminal, Hash, ChevronRight, Play, Radio, X, FileText, Share2, MapPin, Activity, BarChart2, Eye, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- PROCEDURAL GENERATION ENGINE ---

const ENTITIES = [
    "Tech Giant 'CyberCore'", "Senator Williams", "Global Health Org", "Crypto Exchange 'BitVault'", 
    "AI Startup 'Nexus'", "The Central Bank", "Oil Conglomerate", "Secret Service", "Whistleblower",
    "Hacktivist Group 'Anonymous'", "Foreign Diplomat", "SpaceX Competitor"
];

const ACTIONS = [
    "leaks classified data regarding", "denies involvement in", "announces breakthrough in", 
    "accused of manipulating", "suffers massive breach involving", "investigated for", 
    "launches controversial", "bans usage of", "predicts collapse of", "acquires rights to"
];

const TOPICS = [
    "quantum encryption keys", "Project Blue Skies", "synthetic voting algorithms", 
    "underwater data centers", "new viral strain", "digital currency mandate", 
    "Mars colony failure", "AI sentience patch", "global supply chain halt", "mind-interface patent"
];

const SOURCES = [
    { name: "Reuters", type: "Mainstream", reliability: "High" },
    { name: "The Daily Truth", type: "Alternative", reliability: "Low" },
    { name: "TechCrunch", type: "Tech", reliability: "High" },
    { name: "DeepNet Forum", type: "Darkweb", reliability: "Unverified" },
    { name: "User @FreedomEagle", type: "Social", reliability: "Low" },
    { name: "Global Finance", type: "Finance", reliability: "High" },
    { name: "Health Watch", type: "Health", reliability: "Medium" },
    { name: "Cyber Sentinel", type: "Cyber", reliability: "High" }
];

const CATEGORIES: ('Politics' | 'Health' | 'Finance' | 'Tech' | 'Global' | 'Cyber')[] = [
    'Politics', 'Health', 'Finance', 'Tech', 'Global', 'Cyber'
];

const generateNewsItem = (): NewsItem => {
    const entity = ENTITIES[Math.floor(Math.random() * ENTITIES.length)];
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const sourceObj = SOURCES[Math.floor(Math.random() * SOURCES.length)];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    
    // Determine status based on source reliability + random chaos
    let status: Classification = 'Unverified';
    if (sourceObj.reliability === 'High') status = Math.random() > 0.9 ? 'Misleading' : 'Real'; // Even reputable sources slip
    else if (sourceObj.reliability === 'Low') status = Math.random() > 0.4 ? 'Fake' : 'Misleading';
    else status = Math.random() > 0.5 ? 'Real' : 'Unverified';

    return {
        id: Math.random().toString(36).substr(2, 9),
        title: `${entity} ${action} ${topic}`,
        source: sourceObj.name,
        category: category,
        timestamp: Date.now(),
        virality: Math.floor(Math.random() * 100),
        status: status,
        snippet: `Latest intelligence indicates significant activity surrounding ${topic}. Analysts are monitoring ${entity} closely as reports flood in from ${sourceObj.name}. Impact assessment underway.`,
        author: sourceObj.type === 'Social' ? 'Citizen Journalist' : 'Staff Reporter'
    };
};

// --- COMPONENT ---

export const RealTimeNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLive, setIsLive] = useState(true);
  const [tickerOffset, setTickerOffset] = useState(0);
  const [viewingItem, setViewingItem] = useState<NewsItem | null>(null);
  
  // Sidebar Chart Data
  const [velocityData, setVelocityData] = useState(
      Array.from({ length: 20 }, (_, i) => ({ time: i, value: Math.floor(Math.random() * 50) + 30 }))
  );

  // Initial Population
  useEffect(() => {
    const initialBatch = Array.from({ length: 8 }).map(generateNewsItem);
    // Sort by time descending
    initialBatch.sort((a, b) => b.timestamp - a.timestamp);
    setNews(initialBatch);
  }, []);

  // Live Stream Effect
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newItem = generateNewsItem();
      setNews(prev => {
        const updated = [newItem, ...prev];
        return updated.slice(0, 50); // Keep max 50 items
      });

      // Update Chart Data
      setVelocityData(prev => {
          const newValue = Math.floor(Math.random() * 80) + 20;
          return [...prev.slice(1), { time: prev[prev.length - 1].time + 1, value: newValue }];
      });

    }, 3500); // New item every 3.5s

    return () => clearInterval(interval);
  }, [isLive]);

  // Ticker Animation
  useEffect(() => {
      const interval = setInterval(() => {
          setTickerOffset(prev => (prev > 1000 ? -500 : prev + 1));
      }, 50);
      return () => clearInterval(interval);
  }, []);

  const filteredNews = news.filter(item => {
      const matchesFilter = filter === 'All' || item.category === filter;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.source.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: Classification) => {
    switch(status) {
        case 'Real': return 'text-green-400 border-green-500/20 bg-green-500/10';
        case 'Fake': return 'text-red-400 border-red-500/20 bg-red-500/10';
        case 'Misleading': return 'text-orange-400 border-orange-500/20 bg-orange-500/10';
        case 'Unverified': return 'text-slate-400 border-slate-500/20 bg-slate-500/10';
        case 'Satire': return 'text-purple-400 border-purple-500/20 bg-purple-500/10';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
      const seconds = Math.floor((Date.now() - timestamp) / 1000);
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      return `${Math.floor(minutes / 60)}h ago`;
  };

  const generateFullReport = (item: NewsItem) => {
      const impactLevel = item.virality > 80 ? "CRITICAL" : item.virality > 50 ? "HIGH" : "MODERATE";
      const region = ["North America", "Eastern Europe", "APAC Region", "Global Internet"][Math.floor(Math.random() * 4)];
      
      return (
          <div className="space-y-4 text-sm font-mono text-slate-300 leading-relaxed">
              <div className="p-3 bg-black/40 border border-white/5 rounded-lg mb-4 grid grid-cols-2 gap-4">
                  <div>
                      <span className="block text-[10px] text-slate-500 uppercase">Origin Source</span>
                      <span className="text-white font-bold">{item.source.toUpperCase()}</span>
                  </div>
                  <div>
                      <span className="block text-[10px] text-slate-500 uppercase">Impact Level</span>
                      <span className={`font-bold ${item.virality > 80 ? 'text-red-500' : 'text-primary-400'}`}>{impactLevel}</span>
                  </div>
                  <div>
                      <span className="block text-[10px] text-slate-500 uppercase">Geo Vector</span>
                      <span className="text-white">{region}</span>
                  </div>
                  <div>
                      <span className="block text-[10px] text-slate-500 uppercase">Author</span>
                      <span className="text-white">{item.author}</span>
                  </div>
              </div>

              <h4 className="text-primary-400 font-bold uppercase tracking-wider text-xs border-b border-white/10 pb-1 mb-2">Decrypted Intercept</h4>
              <p>
                  <span className="text-slate-500">DATELINE {new Date(item.timestamp).toLocaleTimeString()} // </span>
                  {item.snippet} Intelligence analysts have detected a surge in traffic originating from {item.category === 'Tech' ? 'Silicon Valley nodes' : item.category === 'Politics' ? 'DC-Metro subnet' : 'Global relay points'}. 
                  The narrative "{item.title}" has shown a velocity increase of {item.virality}% in the last hour.
              </p>
              <p>
                  Primary distribution vectors include encrypted messaging apps (Telegram/Signal) and tier-2 social platforms. 
                  Sentiment analysis indicates a {item.virality > 50 ? 'HIGH' : 'MODERATE'} emotional payload designed to trigger {item.virality > 80 ? 'outrage' : 'curiosity'} among target demographics.
              </p>

              <h4 className="text-red-400 font-bold uppercase tracking-wider text-xs border-b border-white/10 pb-1 mb-2 mt-6">Recommended Action</h4>
              <p className="text-slate-200">
                  {item.status === 'Fake' ? 'Immediate containment protocols advised. Flag as disinformation and deploy counter-narrative bots.' : 
                   item.status === 'Misleading' ? 'Issue context card and deploy community notes to clarify nuance.' : 
                   'Monitor for mutation. No immediate interdiction required. Archive for pattern matching.'}
              </p>
          </div>
      );
  };

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-140px)] flex flex-col animate-fade-in pb-6 relative">
      
      {/* Top Header & Ticker */}
      <div className="mb-6 space-y-4 flex-shrink-0">
          <div className="flex justify-between items-end">
              <div>
                  <h1 className="text-4xl font-black text-white tracking-tighter flex items-center">
                      <Radio className="w-8 h-8 mr-3 text-red-500 animate-pulse" />
                      GLOBAL INTEL FEED
                  </h1>
                  <p className="text-slate-400 font-mono text-sm mt-1">
                      REAL-TIME MISINFORMATION MONITORING // <span className="text-primary-400">NO QUOTA USAGE MODE</span>
                  </p>
              </div>
              
              <div className="flex items-center space-x-4">
                  <div className="bg-black/40 border border-white/10 rounded-full px-4 py-2 flex items-center space-x-3">
                      <button onClick={() => setIsLive(!isLive)} className="flex items-center space-x-2 text-xs font-bold uppercase hover:text-white transition-colors">
                          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
                          <span className={isLive ? 'text-red-400' : 'text-slate-500'}>{isLive ? 'Live Stream' : 'Paused'}</span>
                      </button>
                      <div className="w-px h-4 bg-white/10"></div>
                      <span className="text-xs text-slate-400 font-mono">{news.length} ITEMS LOGGED</span>
                  </div>
              </div>
          </div>

          {/* Scrolling Ticker */}
          <div className="w-full bg-black/60 border-y border-white/10 h-8 overflow-hidden relative flex items-center">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10"></div>
              
              <div className="whitespace-nowrap flex items-center space-x-8" style={{ transform: `translateX(-${tickerOffset * 2}px)` }}>
                  {news.slice(0, 10).map((item, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                          <span className="text-red-500">>>></span>
                          <span className="font-bold text-white uppercase">{item.category}:</span>
                          <span>{item.title}</span>
                          <span className={`text-[10px] px-1 rounded ${getStatusColor(item.status)}`}>{item.status}</span>
                      </div>
                  ))}
                  {/* Duplicate for loop illusion */}
                  {news.slice(0, 10).map((item, i) => (
                      <div key={`dup-${i}`} className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                          <span className="text-red-500">>>></span>
                          <span className="font-bold text-white uppercase">{item.category}:</span>
                          <span>{item.title}</span>
                          <span className={`text-[10px] px-1 rounded ${getStatusColor(item.status)}`}>{item.status}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          
          {/* Left: Feed Controls & List */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 min-h-0">
              {/* Controls */}
              <div className="glass-panel p-2 rounded-xl border-white/10 flex items-center justify-between flex-shrink-0">
                  <div className="flex space-x-1 overflow-x-auto no-scrollbar">
                      {['All', ...CATEGORIES].map(cat => (
                          <button
                             key={cat}
                             onClick={() => setFilter(cat)}
                             className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                 filter === cat 
                                 ? 'bg-white/10 text-white shadow-lg' 
                                 : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                             }`}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>
                  <div className="relative ml-4 hidden md:block">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                          type="text" 
                          placeholder="Filter stream..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 pr-4 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-primary-500 w-48"
                      />
                  </div>
              </div>

              {/* Infinite Scroll List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-4">
                  {filteredNews.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => setViewingItem(item)}
                        className={`glass-panel p-4 rounded-xl border-white/5 transition-all group animate-fade-in cursor-pointer hover:bg-white/5 hover:border-primary-500/30 ${viewingItem?.id === item.id ? 'border-primary-500/50 bg-white/5' : ''}`}
                      >
                          <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${getStatusColor(item.status)}`}>
                                      {item.status}
                                  </span>
                                  <span className="text-xs text-slate-500 flex items-center font-mono">
                                      <Clock className="w-3 h-3 mr-1" /> {formatTimeAgo(item.timestamp)}
                                  </span>
                                  <span className="text-xs text-primary-400 font-bold">• {item.source}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-slate-600 group-hover:text-primary-400 transition-colors">
                                  <Activity className="w-3 h-3" />
                                  <span className="text-xs font-mono">{item.virality}% VR</span>
                              </div>
                          </div>
                          
                          <div className="flex gap-4">
                              <div className="flex-1">
                                  <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-primary-400 transition-colors">
                                      {item.title}
                                  </h3>
                                  <p className="text-sm text-slate-400 line-clamp-1 leading-relaxed">
                                      {item.snippet}
                                  </p>
                              </div>
                              <div className="flex items-center justify-center pl-4 border-l border-white/5">
                                 <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white" />
                              </div>
                          </div>
                      </div>
                  ))}
                  {filteredNews.length === 0 && (
                      <div className="text-center py-20 text-slate-500">
                          <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No intelligence found matching query.</p>
                      </div>
                  )}
              </div>
          </div>

          {/* Right: Sidebar Widgets */}
          <div className="hidden lg:col-span-4 lg:flex flex-col gap-6 overflow-y-auto custom-scrollbar pb-4">
              
              {/* Narrative Velocity Chart */}
              <div className="glass-panel p-6 rounded-3xl border-white/5 bg-black/40">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center">
                          <BarChart2 className="w-4 h-4 mr-2 text-primary-400" /> Narrative Velocity
                      </h3>
                      <span className="text-xs text-green-400 font-mono">+12% / hr</span>
                  </div>
                  <div className="h-32 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={velocityData}>
                              <defs>
                                  <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#velocityGradient)" />
                              <XAxis hide />
                              <YAxis hide domain={[0, 100]} />
                              <Tooltip 
                                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                                  itemStyle={{ color: '#fff' }}
                                  labelStyle={{ display: 'none' }}
                              />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* High Alert Widget */}
              <div className="glass-panel p-6 rounded-3xl border-red-500/20 bg-red-950/10 relative overflow-hidden flex-shrink-0">
                  <div className="absolute top-0 right-0 p-4">
                      <AlertTriangle className="w-12 h-12 text-red-500/20" />
                  </div>
                  <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center">
                      <Shield className="w-4 h-4 mr-2" /> Critical Threat
                  </h3>
                  
                  {news.find(n => n.virality > 90) ? (
                      <div className="relative z-10">
                          <span className="text-xs text-white bg-red-600 px-2 py-0.5 rounded font-bold uppercase mb-2 inline-block animate-pulse">
                              Viral Spike Detected
                          </span>
                          <h4 className="text-white font-bold leading-tight mb-2">
                              {news.find(n => n.virality > 90)?.title}
                          </h4>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                              <div className="h-full bg-red-500 w-[92%] animate-pulse"></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-red-300 mt-1 font-mono">
                              <span>IMPACT: CRITICAL</span>
                              <span>VELOCITY: 92/100</span>
                          </div>
                      </div>
                  ) : (
                      <div className="text-slate-400 text-sm">No critical threats detected in current window.</div>
                  )}
              </div>

              {/* Trending Entities */}
              <div className="glass-panel p-6 rounded-3xl border-white/5 bg-black/40 flex-1 min-h-[200px]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center">
                      <Hash className="w-4 h-4 mr-2 text-primary-400" /> Narrative Clusters
                  </h3>
                  <div className="space-y-3">
                      {ENTITIES.slice(0, 6).map((entity, i) => (
                          <div key={i} className="flex items-center justify-between group cursor-pointer p-2 rounded hover:bg-white/5 transition-colors">
                              <div className="flex items-center space-x-3">
                                  <span className="text-slate-600 font-mono text-xs">0{i+1}</span>
                                  <span className="text-slate-300 text-sm font-medium group-hover:text-white truncate max-w-[150px]">
                                      {entity.replace(/'/g, '')}
                                  </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                  <div className={`w-16 h-1 rounded-full ${i < 2 ? 'bg-red-500' : 'bg-primary-500'} opacity-50`}></div>
                                  <ChevronRight className="w-3 h-3 text-slate-600" />
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Source Breakdown */}
              <div className="glass-panel p-6 rounded-3xl border-white/5 bg-black/40 flex-shrink-0">
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Source Reliability</h3>
                   <div className="space-y-4">
                       <div className="flex items-center justify-between text-xs">
                           <span className="text-green-400">Verified Mainstream</span>
                           <span className="text-white font-mono">42%</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1 rounded-full">
                           <div className="h-full bg-green-500 w-[42%]"></div>
                       </div>
                       
                       <div className="flex items-center justify-between text-xs">
                           <span className="text-orange-400">Unverified Social</span>
                           <span className="text-white font-mono">35%</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1 rounded-full">
                           <div className="h-full bg-orange-500 w-[35%]"></div>
                       </div>

                       <div className="flex items-center justify-between text-xs">
                           <span className="text-red-400">Known Disinfo</span>
                           <span className="text-white font-mono">23%</span>
                       </div>
                       <div className="w-full bg-slate-800 h-1 rounded-full">
                           <div className="h-full bg-red-500 w-[23%]"></div>
                       </div>
                   </div>
              </div>

          </div>

      </div>

      {/* INTELLIGENCE MODAL */}
      {viewingItem && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setViewingItem(null)}></div>
              <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(14,165,233,0.15)] overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                  
                  {/* Header */}
                  <div className="h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500 w-full"></div>
                  <div className="p-6 border-b border-white/10 flex justify-between items-start bg-white/5">
                      <div>
                          <div className="flex items-center space-x-3 mb-2">
                              <span className="px-2 py-0.5 bg-primary-600/20 border border-primary-500/30 text-primary-400 text-[10px] font-bold uppercase tracking-widest rounded-sm">Confidential</span>
                              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">ID: INTEL-{viewingItem.id.toUpperCase()}</span>
                          </div>
                          <h2 className="text-xl font-bold text-white leading-tight pr-4">{viewingItem.title}</h2>
                      </div>
                      <button onClick={() => setViewingItem(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 relative">
                      {/* Detailed Content */}
                      {generateFullReport(viewingItem)}
                  </div>

                  <div className="p-6 border-t border-white/10 bg-black/40 flex justify-between items-center gap-4">
                      <div className="flex items-center space-x-2">
                          <button className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5">
                              <Share2 className="w-4 h-4" />
                          </button>
                          <button className="p-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5">
                              <FileText className="w-4 h-4" />
                          </button>
                      </div>
                      
                      <div className="flex space-x-3 flex-1 justify-end">
                           <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-sm hover:bg-red-500/20 transition-colors flex items-center">
                               <Lock className="w-4 h-4 mr-2" /> Block Source
                           </button>
                           <button className="px-4 py-2 rounded-lg bg-primary-600 text-white font-bold text-sm hover:bg-primary-500 transition-colors flex items-center shadow-lg shadow-primary-500/20">
                               <Globe className="w-4 h-4 mr-2" /> Trace Vector
                           </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};