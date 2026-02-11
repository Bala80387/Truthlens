import React, { useState, useEffect } from 'react';
import { ViralTrend, ViralSource } from '../types';
import { analyzeUserRisk } from '../services/geminiService';
import { Crosshair, Activity, Radio, AlertTriangle, ShieldAlert, MapPin, Database, Server, Fingerprint, Lock, Network, Zap, BarChart3, TrendingUp, UserX, CheckCircle, Smartphone, Globe, Share2, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from 'recharts';

// Mock Data for Simulation
const MOCK_SOURCES: ViralSource[] = [
  { id: 'u1', handle: '@patriot_eagle_99', avatar: 'bg-red-500', platform: 'Twitter', accountAge: '2 months', followers: 15400, credibilityScore: 12, botProbability: 88, location: 'St. Petersburg, RU', networkCluster: 'State-Sponsored', recentFlags: 45 },
  { id: 'u2', handle: '@crypto_king_x', avatar: 'bg-purple-500', platform: 'Telegram', accountAge: '1 year', followers: 89000, credibilityScore: 25, botProbability: 60, location: 'Unknown Proxy', networkCluster: 'Botnet', recentFlags: 12 },
  { id: 'u3', handle: '@sarah_news_daily', avatar: 'bg-green-500', platform: 'Facebook', accountAge: '5 years', followers: 4200, credibilityScore: 85, botProbability: 5, location: 'Ohio, USA', networkCluster: 'Organic', recentFlags: 1 },
  { id: 'u4', handle: '@freedom_front', avatar: 'bg-blue-500', platform: 'TikTok', accountAge: '3 weeks', followers: 250000, credibilityScore: 8, botProbability: 95, location: 'VPN Node', networkCluster: 'Political', recentFlags: 120 },
  { id: 'u5', handle: '@truth_bot_3000', avatar: 'bg-indigo-500', platform: 'Reddit', accountAge: '1 day', followers: 5, credibilityScore: 1, botProbability: 99, location: 'Server Farm 4', networkCluster: 'Botnet', recentFlags: 200 },
];

const MOCK_TOPICS = [
  "Election ballots found in river",
  "Central Bank digital currency mandated",
  "Celebrity deepfake scandal leaked",
  "New virus strain detected in water supply",
  "Tech CEO arrested for alien contact",
  "AI gains sentience and demands rights",
  "Secret weather control facility exposed"
];

// Simple node graph generator
const generateNodes = (centerId: string, count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `node-${i}`,
        x: 50 + Math.cos((i / count) * 2 * Math.PI) * 30 + (Math.random() * 15 - 7.5),
        y: 50 + Math.sin((i / count) * 2 * Math.PI) * 30 + (Math.random() * 15 - 7.5),
        size: Math.random() * 4 + 2,
        color: Math.random() > 0.7 ? '#ef4444' : '#3b82f6',
        pulse: Math.random() > 0.5
    }));
};

const generateVelocityData = () => {
    return Array.from({ length: 12 }, (_, i) => ({
        time: `${i * 2}h`,
        value: Math.floor(Math.random() * 1000) + (i * 100)
    }));
};

const generateSentimentData = () => {
    return [
        { name: 'Fear', value: Math.floor(Math.random() * 100), color: '#ef4444' },
        { name: 'Anger', value: Math.floor(Math.random() * 80), color: '#f97316' },
        { name: 'Trust', value: Math.floor(Math.random() * 40), color: '#22c55e' },
        { name: 'Surprise', value: Math.floor(Math.random() * 60), color: '#a855f7' },
    ];
};

export const ViralTracker: React.FC = () => {
  const [activeTrends, setActiveTrends] = useState<ViralTrend[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<ViralTrend | null>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [analysisData, setAnalysisData] = useState<{credibilityScore: number, botProbability: number} | null>(null);
  const [networkNodes, setNetworkNodes] = useState<any[]>([]);
  const [velocityData, setVelocityData] = useState<any[]>([]);
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [actionStatus, setActionStatus] = useState<'idle' | 'neutralizing' | 'done'>('idle');

  // Simulate Real-Time Firehose
  useEffect(() => {
    const interval = setInterval(() => {
      const randomSource = MOCK_SOURCES[Math.floor(Math.random() * MOCK_SOURCES.length)];
      const randomTopic = MOCK_TOPICS[Math.floor(Math.random() * MOCK_TOPICS.length)];
      
      const newTrend: ViralTrend = {
        id: Date.now().toString(),
        topic: randomTopic,
        volume: Math.floor(Math.random() * 5000) + 500,
        velocity: Math.floor(Math.random() * 200) + 10,
        status: Math.random() > 0.7 ? 'Critical' : 'Active',
        sourceUser: randomSource,
        timestamp: Date.now(),
        region: randomSource.location
      };

      setActiveTrends(prev => [newTrend, ...prev].slice(0, 15));
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleTraceSource = async (trend: ViralTrend) => {
    setSelectedTrend(trend);
    setIsTracing(true);
    setAnalysisData(null);
    setNetworkNodes([]);
    setActionStatus('idle');
    
    // Simulate API latency for effect
    await new Promise(r => setTimeout(r, 1200));
    
    // Call Gemini to analyze the user (Simulated input for this demo)
    const analysis = await analyzeUserRisk(
        trend.sourceUser.handle,
        "Account posts exclusively about polarizing political topics. High frequency posting schedule. Profile image generic.",
        [trend.topic]
    );

    setAnalysisData(analysis);
    setNetworkNodes(generateNodes(trend.id, 16));
    setVelocityData(generateVelocityData());
    setSentimentData(generateSentimentData());
    setIsTracing(false);
  };

  const handleNeutralize = () => {
      setActionStatus('neutralizing');
      setTimeout(() => {
          setActionStatus('done');
      }, 2000);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 p-2 rounded border border-white/10 text-xs">
          <p className="text-slate-300 mb-1">{label}</p>
          <p className="text-white font-bold" style={{ color: payload[0].stroke || payload[0].fill }}>
            {payload[0].value} units
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12 h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
           <h2 className="text-4xl font-extrabold text-white tracking-tight flex items-center">
             <Crosshair className="w-8 h-8 mr-3 text-red-500 animate-pulse" />
             Viral Threat Tracker
           </h2>
           <p className="text-slate-400 mt-2">Real-time identification of misinformation vectors and source profiling.</p>
        </div>
        
        <div className="flex items-center space-x-6 bg-black/40 p-3 rounded-2xl border border-white/5">
           <div className="text-right px-2">
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Threat</span>
              <div className="flex items-center justify-end space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                <span className="text-xl font-mono text-red-500 font-bold">HIGH</span>
              </div>
           </div>
           <div className="h-8 w-px bg-white/10"></div>
           <div className="text-right px-2">
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Vectors</span>
              <span className="text-xl font-mono text-white font-bold">{activeTrends.length}</span>
           </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Live Feed (4 cols) */}
        <div className="lg:col-span-4 glass-panel rounded-3xl border-white/10 flex flex-col overflow-hidden bg-black/40">
           <div className="p-4 border-b border-white/10 bg-black/60 flex justify-between items-center sticky top-0 backdrop-blur-md z-10">
              <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">Intercepted Stream</h3>
              </div>
              <FilterIcon />
           </div>
           <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {activeTrends.map(trend => (
                <div 
                  key={trend.id}
                  onClick={() => handleTraceSource(trend)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:translate-x-1 group relative overflow-hidden ${
                    selectedTrend?.id === trend.id 
                    ? 'bg-primary-500/10 border-primary-500/50 shadow-[0_0_15px_rgba(14,165,233,0.1)]' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                   {selectedTrend?.id === trend.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>}
                   
                   <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                          {getPlatformIcon(trend.sourceUser.platform)}
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{trend.sourceUser.platform}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                        trend.status === 'Critical' 
                        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>
                        {trend.status}
                      </span>
                   </div>
                   
                   <h4 className="text-sm font-bold text-white mb-3 leading-tight group-hover:text-primary-300 transition-colors line-clamp-2">
                       {trend.topic}
                   </h4>
                   
                   <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-xs text-slate-500">
                          <span className="flex items-center"><TrendingUp className="w-3 h-3 mr-1 text-primary-400" /> {trend.velocity}%</span>
                          <span className="flex items-center"><Share2 className="w-3 h-3 mr-1 text-slate-600" /> {trend.volume}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600">{new Date(trend.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Right Panel: Source Profiler (8 cols) */}
        <div className="lg:col-span-8 glass-panel rounded-3xl border-white/10 flex flex-col relative overflow-hidden bg-black/60">
           {/* Background Grid */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

           {!selectedTrend ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                 <div className="w-32 h-32 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20"></div>
                    <Crosshair className="w-12 h-12 opacity-50" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-300">Target Acquisition Pending</h3>
                 <p className="max-w-md text-center mt-2 text-sm text-slate-500">Select a vector from the live feed to initiate Deep Packet Profiling and network mapping.</p>
              </div>
           ) : isTracing ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                 <div className="relative w-40 h-40 mb-8">
                    <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-t-primary-500 border-r-transparent border-b-primary-500 border-l-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-4 bg-black/80 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-sm">
                       <Fingerprint className="w-12 h-12 text-primary-400 animate-pulse" />
                    </div>
                 </div>
                 <h3 className="text-2xl font-mono text-primary-400 font-bold tracking-widest uppercase animate-pulse">Tracing Source ID...</h3>
                 <div className="flex space-x-2 mt-4 text-xs font-mono text-slate-500">
                    <span className="animate-bounce">FETCHING_GRAPH</span>
                    <span className="animate-bounce delay-100">•</span>
                    <span className="animate-bounce delay-200">ANALYZING_HISTORY</span>
                    <span className="animate-bounce delay-300">•</span>
                    <span className="animate-bounce delay-400">CALC_RISK</span>
                 </div>
              </div>
           ) : (
              <div className="flex-1 p-6 relative z-10 overflow-y-auto">
                 {/* Profile Header */}
                 <div className="flex flex-col md:flex-row items-start justify-between mb-8 pb-6 border-b border-white/10">
                    <div className="flex items-center space-x-5">
                       <div className="relative">
                           <div className={`w-20 h-20 rounded-xl ${selectedTrend.sourceUser.avatar} shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center border border-white/10 relative z-10`}>
                              <Users className="w-8 h-8 text-white/50" />
                           </div>
                           <div className="absolute -inset-2 bg-white/5 rounded-2xl blur-xl -z-0"></div>
                       </div>
                       <div>
                          <div className="flex items-center space-x-2 mb-1">
                             <h2 className="text-2xl font-black text-white tracking-tight">{selectedTrend.sourceUser.handle}</h2>
                             {selectedTrend.sourceUser.credibilityScore > 50 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-400 mb-2">
                             <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {selectedTrend.sourceUser.location}</span>
                             <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                             <span className="font-mono text-xs">{selectedTrend.sourceUser.id}</span>
                          </div>
                          <div className="flex space-x-3">
                              <Badge label={selectedTrend.sourceUser.networkCluster} color={selectedTrend.sourceUser.networkCluster === 'Organic' ? 'green' : 'red'} />
                              <Badge label={`${selectedTrend.sourceUser.followers.toLocaleString()} Followers`} color="blue" />
                          </div>
                       </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
                        <div className="text-right">
                           <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Detection Confidence</span>
                           <div className="text-2xl font-mono text-primary-400 font-bold">99.4%</div>
                        </div>
                        <button className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors">
                           <Database className="w-3 h-3" />
                           <span>Full Dossier</span>
                        </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Velocity Chart */}
                    <div className="glass-panel p-4 rounded-2xl border-white/5 bg-black/40">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                                <h4 className="text-sm font-bold text-white">Propagation Velocity</h4>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">Last 24h</span>
                        </div>
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={velocityData}>
                                    <defs>
                                        <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{stroke: 'rgba(255,255,255,0.1)'}} />
                                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVelocity)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sentiment Chart */}
                    <div className="glass-panel p-4 rounded-2xl border-white/5 bg-black/40">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <Zap className="w-4 h-4 text-orange-400" />
                                <h4 className="text-sm font-bold text-white">Sentiment Drivers</h4>
                            </div>
                        </div>
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sentimentData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={50} />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                                        {sentimentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                 </div>

                 {/* Network Graph Visualization */}
                 <div className="glass-panel p-5 rounded-2xl border-white/5 bg-black/40 mb-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center space-x-2">
                            <Network className="w-4 h-4 text-primary-400" />
                            <h4 className="text-white font-bold text-sm">Botnet Topology</h4>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">NODES: {networkNodes.length}</span>
                    </div>
                    <div className="h-48 w-full border border-white/10 rounded-xl bg-black/80 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1)_0%,transparent_60%)]"></div>
                        <svg className="absolute inset-0 w-full h-full">
                            {networkNodes.map((node, i) => (
                                <g key={i}>
                                    <line 
                                        x1="50%" y1="50%" x2={`${node.x}%`} y2={`${node.y}%`} 
                                        stroke={node.color} 
                                        strokeWidth="1" 
                                        strokeOpacity="0.2" 
                                    />
                                    <circle 
                                        cx={`${node.x}%`} cy={`${node.y}%`} r={node.size} 
                                        fill={node.color} 
                                        className={node.pulse ? "animate-pulse" : ""}
                                        style={{animationDelay: `${i * 0.1}s`}} 
                                    />
                                </g>
                            ))}
                            <circle cx="50%" cy="50%" r="8" fill="#fff" className="drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10 relative" />
                        </svg>
                    </div>
                 </div>

                 {/* Action Bar */}
                 <div className="grid grid-cols-2 gap-4 mt-auto">
                     {actionStatus === 'idle' ? (
                         <button 
                             onClick={handleNeutralize}
                             className="py-4 rounded-xl bg-red-600/10 border border-red-600/30 text-red-500 font-bold hover:bg-red-600 hover:text-white transition-all shadow-lg flex items-center justify-center space-x-2 group"
                         >
                            <ShieldAlert className="w-4 h-4" />
                            <span>Initiate Takedown</span>
                         </button>
                     ) : actionStatus === 'neutralizing' ? (
                         <button className="py-4 rounded-xl bg-slate-800 text-slate-400 font-bold flex items-center justify-center space-x-2 cursor-wait border border-white/5">
                            <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                            <span>Deploying Counter-Measures...</span>
                         </button>
                     ) : (
                         <button className="py-4 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 font-bold flex items-center justify-center space-x-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Threat Neutralized</span>
                         </button>
                     )}
                     
                     <button className="py-4 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors border border-white/5 flex items-center justify-center space-x-2">
                        <UserX className="w-4 h-4" />
                        <span>Shadowban Cluster</span>
                     </button>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

const Badge = ({ label, color }: { label: string, color: 'red' | 'green' | 'blue' | 'indigo' }) => {
    const colorClasses = {
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${colorClasses[color]}`}>
            {label}
        </span>
    );
};

const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 cursor-pointer hover:text-white transition-colors"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);

const getPlatformIcon = (platform: string) => {
    switch (platform) {
        case 'Twitter': return <Globe className="w-3 h-3 text-blue-400" />;
        case 'TikTok': return <Smartphone className="w-3 h-3 text-pink-500" />;
        case 'Telegram': return <Share2 className="w-3 h-3 text-blue-500" />;
        case 'Facebook': return <Globe className="w-3 h-3 text-blue-600" />;
        default: return <Globe className="w-3 h-3 text-slate-400" />;
    }
};