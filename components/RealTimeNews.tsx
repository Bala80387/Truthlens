import React, { useState, useEffect, useRef } from 'react';
import { NewsItem, Classification } from '../types';
import { Search, Filter, RefreshCw, Zap, TrendingUp, AlertTriangle, CheckCircle, Clock, Globe, Shield, Terminal, Hash, ChevronRight, Play, Radio } from 'lucide-react';

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
        return updated.slice(0, 50); // Keep max 50 items to prevent memory bloat
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

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-fade-in pb-6">
      
      {/* Top Header & Ticker */}
      <div className="mb-6 space-y-4">
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
                  {/* Duplicate for loop illusion if needed, but simple translation works for demo */}
              </div>
          </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          
          {/* Left: Feed Controls & List */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 min-h-0">
              {/* Controls */}
              <div className="glass-panel p-2 rounded-xl border-white/10 flex items-center justify-between">
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
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {filteredNews.map((item) => (
                      <div key={item.id} className="glass-panel p-4 rounded-xl border-white/5 hover:border-white/10 transition-all group animate-fade-in">
                          <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${getStatusColor(item.status)}`}>
                                      {item.status}
                                  </span>
                                  <span className="text-xs text-slate-500 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" /> {formatTimeAgo(item.timestamp)}
                                  </span>
                                  <span className="text-xs text-primary-400 font-bold">• {item.source}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-slate-600">
                                  <TrendingUp className="w-3 h-3" />
                                  <span className="text-xs font-mono">{item.virality} VR</span>
                              </div>
                          </div>
                          
                          <div className="flex gap-4">
                              <div className="flex-1">
                                  <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-primary-400 transition-colors cursor-pointer">
                                      {item.title}
                                  </h3>
                                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                                      {item.snippet}
                                  </p>
                              </div>
                              {/* Action Buttons */}
                              <div className="flex flex-col space-y-2 justify-center border-l border-white/5 pl-4 ml-2">
                                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Quick Analyze">
                                      <Zap className="w-4 h-4" />
                                  </button>
                                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Trace Source">
                                      <Globe className="w-4 h-4" />
                                  </button>
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
          <div className="hidden lg:col-span-4 lg:flex flex-col gap-6">
              
              {/* High Alert Widget */}
              <div className="glass-panel p-6 rounded-3xl border-red-500/20 bg-red-950/10 relative overflow-hidden">
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
              <div className="glass-panel p-6 rounded-3xl border-white/5 bg-black/40 flex-1">
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
              <div className="glass-panel p-6 rounded-3xl border-white/5 bg-black/40">
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
    </div>
  );
};