import React, { useState, useEffect } from 'react';
import { ViralTrend, ViralSource } from '../types';
import { analyzeUserRisk } from '../services/geminiService';
import { 
  Crosshair, Activity, Radio, AlertTriangle, ShieldAlert, MapPin, Database, 
  Server, Fingerprint, Lock, Network, Zap, TrendingUp, UserX, CheckCircle, 
  Smartphone, Globe, Share2, Users, Radar, Target, Cpu, Eye, MessageSquare, 
  Wifi, BarChart4, AlertOctagon, CornerDownRight, Brain
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar } from 'recharts';

// --- MOCK DATA GENERATORS ---

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

const generateNodes = (centerId: string, count: number) => {
    return Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 2 * Math.PI;
        const distance = 30 + Math.random() * 20;
        return {
            id: `node-${i}`,
            x: 50 + Math.cos(angle) * distance,
            y: 50 + Math.sin(angle) * distance,
            size: Math.random() * 3 + 2,
            type: i % 5 === 0 ? 'super' : 'leaf',
            color: i % 5 === 0 ? '#ef4444' : '#3b82f6', // Red for super-spreaders, Blue for bots
            pulse: i % 5 === 0
        };
    });
};

const generateVelocityData = () => {
    let prev = 500;
    return Array.from({ length: 24 }, (_, i) => {
        const val = Math.max(0, prev + (Math.random() * 400 - 150));
        prev = val;
        return { time: `${i}:00`, value: Math.floor(val) };
    });
};

const generatePsychographics = () => [
    { subject: 'Fear', A: Math.floor(Math.random() * 100), fullMark: 100 },
    { subject: 'Anger', A: Math.floor(Math.random() * 100), fullMark: 100 },
    { subject: 'Trust', A: Math.floor(Math.random() * 40), fullMark: 100 },
    { subject: 'Urgency', A: Math.floor(Math.random() * 100), fullMark: 100 },
    { subject: 'Bias', A: Math.floor(Math.random() * 90), fullMark: 100 },
];

const generateHeatmap = () => Array.from({ length: 20 }, () => Math.random());

// --- COMPONENT ---

export const ViralTracker: React.FC = () => {
  const [activeTrends, setActiveTrends] = useState<ViralTrend[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<ViralTrend | null>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [networkNodes, setNetworkNodes] = useState<any[]>([]);
  const [velocityData, setVelocityData] = useState<any[]>([]);
  const [psychographics, setPsychographics] = useState<any[]>([]);
  const [regionalHeatmap, setRegionalHeatmap] = useState<number[]>([]);
  const [actionStatus, setActionStatus] = useState<'idle' | 'deploying' | 'active'>('idle');
  const [responseLog, setResponseLog] = useState<string[]>([]);

  // Simulate Real-Time Firehose
  useEffect(() => {
    const interval = setInterval(() => {
      const randomSource = MOCK_SOURCES[Math.floor(Math.random() * MOCK_SOURCES.length)];
      const randomTopic = MOCK_TOPICS[Math.floor(Math.random() * MOCK_TOPICS.length)];
      
      const newTrend: ViralTrend = {
        id: Date.now().toString(),
        topic: randomTopic,
        volume: Math.floor(Math.random() * 15000) + 1000,
        velocity: Math.floor(Math.random() * 300) + 10,
        status: Math.random() > 0.6 ? 'Critical' : 'Active',
        sourceUser: randomSource,
        timestamp: Date.now(),
        region: randomSource.location
      };

      setActiveTrends(prev => {
          const updated = [newTrend, ...prev].slice(0, 8);
          return updated.sort((a,b) => b.velocity - a.velocity); // Sort by velocity
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleTraceSource = async (trend: ViralTrend) => {
    if (selectedTrend?.id === trend.id) return;
    
    setSelectedTrend(trend);
    setIsTracing(true);
    setNetworkNodes([]);
    setActionStatus('idle');
    setResponseLog([]);
    
    // Simulate Processing
    await new Promise(r => setTimeout(r, 1000));
    
    setNetworkNodes(generateNodes(trend.id, 25));
    setVelocityData(generateVelocityData());
    setPsychographics(generatePsychographics());
    setRegionalHeatmap(generateHeatmap());
    setIsTracing(false);
  };

  const handleCounterMeasure = (type: string) => {
      setActionStatus('deploying');
      setResponseLog(prev => [...prev, `> Initializing ${type} protocol...`]);
      
      setTimeout(() => setResponseLog(prev => [...prev, `> Generating counter-narrative vectors...`]), 800);
      setTimeout(() => setResponseLog(prev => [...prev, `> Injecting fact-check metadata...`]), 1600);
      setTimeout(() => {
          setResponseLog(prev => [...prev, `> Deployment Successful. Monitoring impact.`]);
          setActionStatus('active');
      }, 2500);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 p-2 rounded border border-white/10 text-xs shadow-xl backdrop-blur-md">
          <p className="text-slate-400 mb-1 font-mono">{label}</p>
          <div className="flex items-center space-x-2">
             <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
             <span className="text-white font-bold">{payload[0].value.toLocaleString()} Engagements</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in pb-8 h-[calc(100vh-140px)] flex flex-col">
      
      {/* Header Stats Bar */}
      <div className="flex items-center justify-between mb-6 glass-panel p-4 rounded-2xl border-white/10 bg-black/40">
         <div className="flex items-center space-x-4">
            <div className="bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
               <Crosshair className="w-6 h-6 text-red-500" />
            </div>
            <div>
               <h1 className="text-xl font-black text-white tracking-tight leading-none">THREAT WATCH</h1>
               <div className="flex items-center space-x-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-[10px] text-red-400 font-mono tracking-widest uppercase">Live Surveillance Active</span>
               </div>
            </div>
         </div>

         <div className="flex items-center space-x-8">
            <div className="text-right">
               <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Est. Reach</span>
               <span className="text-lg font-mono text-white font-bold">24.5M</span>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="text-right">
               <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Vectors</span>
               <span className="text-lg font-mono text-white font-bold">{activeTrends.length}</span>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="text-right">
               <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">System Status</span>
               <span className="text-lg font-mono text-green-400 font-bold">ARMED</span>
            </div>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT: Feed & List */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 glass-panel rounded-3xl border-white/5 bg-black/40 flex flex-col overflow-hidden">
           <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-md z-10 sticky top-0">
              <div className="flex justify-between items-center">
                 <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-primary-400" /> Vector Feed
                 </h3>
                 <span className="bg-white/5 text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono">{activeTrends.length} DETECTED</span>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {activeTrends.map(trend => (
                <div 
                  key={trend.id}
                  onClick={() => handleTraceSource(trend)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border group relative overflow-hidden ${
                    selectedTrend?.id === trend.id 
                    ? 'bg-white/5 border-primary-500/50 shadow-[inset_0_0_20px_rgba(14,165,233,0.1)]' 
                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                  }`}
                >
                   {/* Progress Bar Background */}
                   <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent to-primary-500/50 transition-all duration-1000" style={{width: `${Math.min(100, trend.velocity / 3)}%`}}></div>

                   <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center space-x-2">
                         <span className={`w-1.5 h-1.5 rounded-full ${trend.status === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`}></span>
                         <span className="text-[10px] text-slate-400 font-mono uppercase">{trend.sourceUser.platform}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{new Date(trend.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                   </div>
                   
                   <h4 className={`text-sm font-bold mb-2 line-clamp-2 ${selectedTrend?.id === trend.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                       {trend.topic}
                   </h4>

                   <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                          <TrendingUp className="w-3 h-3 text-primary-400" />
                          <span className="text-[10px] font-mono text-primary-400">+{trend.velocity}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-slate-600" />
                          <span className="text-[10px] text-slate-500 font-mono">{(trend.volume / 1000).toFixed(1)}k</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* RIGHT: Analysis Console */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 flex flex-col gap-6 overflow-y-auto pr-1">
           
           {!selectedTrend ? (
               <div className="flex-1 glass-panel rounded-3xl border-white/5 bg-black/40 flex flex-col items-center justify-center text-slate-600 relative overflow-hidden">
                   <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                   <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center mb-6 relative z-10">
                        <Radar className="w-16 h-16 opacity-20 animate-[spin_10s_linear_infinite]" />
                   </div>
                   <h2 className="text-xl font-bold text-slate-400 relative z-10">Waiting for Target Selection</h2>
                   <p className="text-sm text-slate-600 mt-2 relative z-10">Select a viral vector to initiate forensic analysis.</p>
               </div>
           ) : isTracing ? (
               <div className="flex-1 glass-panel rounded-3xl border-white/5 bg-black/40 flex flex-col items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_0%,transparent_70%)]"></div>
                   <div className="relative z-10 text-center">
                        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-1">Tracing Network Topology</h2>
                        <div className="text-xs font-mono text-primary-400">
                             DP: {Math.floor(Math.random() * 99999)} // SECTOR: {Math.floor(Math.random() * 9)} // NODE_HOP: {Math.floor(Math.random() * 24)}
                        </div>
                   </div>
               </div>
           ) : (
               <>
               {/* Top Row: Target Profile & Propagation Map */}
               <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                   {/* Target Profile Card */}
                   <div className="glass-panel p-6 rounded-3xl border-white/5 bg-black/40 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none"></div>
                       
                       <div className="flex items-start justify-between mb-6">
                           <div className="flex items-center space-x-4">
                               <div className={`w-16 h-16 rounded-2xl ${selectedTrend.sourceUser.avatar} flex items-center justify-center shadow-lg border border-white/10`}>
                                   <span className="font-black text-2xl text-white/80">{selectedTrend.sourceUser.handle[1].toUpperCase()}</span>
                               </div>
                               <div>
                                   <div className="flex items-center space-x-2">
                                       <h2 className="text-lg font-bold text-white">{selectedTrend.sourceUser.handle}</h2>
                                       {selectedTrend.sourceUser.networkCluster === 'State-Sponsored' && (
                                           <span className="bg-red-500/20 text-red-400 text-[9px] px-1.5 py-0.5 rounded border border-red-500/30 uppercase font-bold">State Actor</span>
                                       )}
                                   </div>
                                   <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                                       <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {selectedTrend.sourceUser.location}</span>
                                       <span className="flex items-center"><AlertOctagon className="w-3 h-3 mr-1 text-red-500" /> {selectedTrend.sourceUser.recentFlags} Flags</span>
                                   </div>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Risk Score</div>
                               <div className="text-3xl font-black text-red-500">{selectedTrend.sourceUser.botProbability}</div>
                           </div>
                       </div>

                       <div className="grid grid-cols-2 gap-3 mb-4">
                           <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                               <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Cluster Type</div>
                               <div className="text-sm font-bold text-white flex items-center">
                                   <Network className="w-3 h-3 mr-2 text-primary-400" />
                                   {selectedTrend.sourceUser.networkCluster}
                               </div>
                           </div>
                           <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                               <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Account Age</div>
                               <div className="text-sm font-bold text-white flex items-center">
                                   <Database className="w-3 h-3 mr-2 text-primary-400" />
                                   {selectedTrend.sourceUser.accountAge}
                               </div>
                           </div>
                       </div>
                   </div>

                   {/* Digital Territory (Heatmap) */}
                   <div className="xl:col-span-2 glass-panel p-6 rounded-3xl border-white/5 bg-black/40 flex flex-col">
                       <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center space-x-2">
                               <Globe className="w-5 h-5 text-primary-400" />
                               <h3 className="font-bold text-white text-sm uppercase tracking-wider">Regional Saturation</h3>
                           </div>
                           <div className="flex space-x-2 text-[10px] font-mono">
                               <span className="flex items-center"><div className="w-2 h-2 bg-red-500 mr-1"></div> CRITICAL</span>
                               <span className="flex items-center"><div className="w-2 h-2 bg-slate-700 mr-1"></div> STABLE</span>
                           </div>
                       </div>
                       <div className="flex-1 grid grid-cols-10 grid-rows-2 gap-1 relative">
                           {regionalHeatmap.map((val, i) => (
                               <div 
                                   key={i} 
                                   className="rounded-sm transition-all duration-1000 hover:scale-110 cursor-crosshair border border-black/20"
                                   style={{
                                       backgroundColor: val > 0.7 ? '#ef4444' : val > 0.4 ? '#eab308' : '#334155',
                                       opacity: 0.4 + (val * 0.6)
                                   }}
                               >
                                   <div className="h-full w-full opacity-0 hover:opacity-100 flex items-center justify-center">
                                       <span className="text-[8px] font-bold text-white">{Math.floor(val * 100)}%</span>
                                   </div>
                               </div>
                           ))}
                           {/* Overlay Graph */}
                           <div className="absolute inset-0 pointer-events-none">
                               <ResponsiveContainer width="100%" height="100%">
                                   <AreaChart data={velocityData}>
                                       <defs>
                                           <linearGradient id="gradientOverlay" x1="0" y1="0" x2="0" y2="1">
                                               <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                                               <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                                           </linearGradient>
                                       </defs>
                                       <Area type="monotone" dataKey="value" stroke="none" fill="url(#gradientOverlay)" />
                                   </AreaChart>
                               </ResponsiveContainer>
                           </div>
                       </div>
                   </div>
               </div>

               {/* Middle Row: Network Topology & Forensics */}
               <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[300px]">
                   
                   {/* Network Graph */}
                   <div className="xl:col-span-2 glass-panel p-6 rounded-3xl border-white/5 bg-black/40 relative overflow-hidden flex flex-col">
                       <div className="flex items-center justify-between mb-4 relative z-10">
                           <div className="flex items-center space-x-2">
                               <Share2 className="w-5 h-5 text-purple-400" />
                               <h3 className="font-bold text-white text-sm uppercase tracking-wider">Infection Topology</h3>
                           </div>
                           <div className="bg-black/60 px-2 py-1 rounded border border-white/10 text-[10px] text-slate-400 font-mono">
                               NODES: {networkNodes.length} // LINKS: {networkNodes.length * 2}
                           </div>
                       </div>
                       
                       <div className="flex-1 relative border border-white/5 rounded-2xl bg-black/60 overflow-hidden">
                           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1)_0%,transparent_50%)]"></div>
                           <svg className="absolute inset-0 w-full h-full">
                               {/* Links */}
                               {networkNodes.map((node, i) => (
                                   <line 
                                       key={`line-${i}`}
                                       x1="50%" y1="50%" x2={`${node.x}%`} y2={`${node.y}%`} 
                                       stroke={node.type === 'super' ? '#ef4444' : '#3b82f6'} 
                                       strokeWidth="1" 
                                       strokeOpacity="0.3"
                                       strokeDasharray={node.type === 'super' ? "none" : "4 4"}
                                   >
                                       {node.type === 'super' && (
                                           <animate attributeName="stroke-opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
                                       )}
                                   </line>
                               ))}
                               {/* Nodes */}
                               {networkNodes.map((node, i) => (
                                   <g key={`node-${i}`}>
                                       {node.type === 'super' && (
                                           <circle cx={`${node.x}%`} cy={`${node.y}%`} r={node.size * 3} fill={node.color} opacity="0.2" className="animate-ping" />
                                       )}
                                       <circle 
                                           cx={`${node.x}%`} cy={`${node.y}%`} r={node.size} 
                                           fill={node.color} 
                                           stroke="#fff" strokeWidth="1"
                                       />
                                   </g>
                               ))}
                               {/* Patient Zero */}
                               <circle cx="50%" cy="50%" r="6" fill="#fff" className="drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10" />
                               <text x="50%" y="54%" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">PATIENT ZERO</text>
                           </svg>
                       </div>
                   </div>

                   {/* Psychographics */}
                   <div className="glass-panel p-6 rounded-3xl border-white/5 bg-black/40 flex flex-col">
                       <div className="flex items-center space-x-2 mb-4">
                           <Brain className="w-5 h-5 text-orange-400" />
                           <h3 className="font-bold text-white text-sm uppercase tracking-wider">Cognitive Impact</h3>
                       </div>
                       <div className="flex-1 relative">
                           <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="70%" data={psychographics}>
                                   <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                   <RechartsRadar name="Impact" dataKey="A" stroke="#f97316" strokeWidth={2} fill="#f97316" fillOpacity={0.4} />
                                   <Tooltip content={<CustomTooltip />} />
                               </RadarChart>
                           </ResponsiveContainer>
                           <div className="absolute bottom-0 w-full text-center">
                               <div className="inline-block bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded text-[10px] text-orange-400 font-bold uppercase">
                                   Primary Vector: FEAR
                               </div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* Bottom: Action Console */}
               <div className="glass-panel p-6 rounded-3xl border-t-2 border-t-primary-500/50 bg-black/60 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
                   
                   <div className="flex flex-col md:flex-row gap-6">
                       {/* Terminal Log */}
                       <div className="flex-1 bg-black rounded-xl border border-white/10 p-3 font-mono text-xs overflow-y-auto h-32 custom-scrollbar shadow-inner">
                           <div className="text-slate-500 mb-1 border-b border-white/10 pb-1 flex justify-between">
                               <span>RESPONSE_CONSOLE_V2.1</span>
                               <span className={actionStatus === 'active' ? 'text-green-500' : 'text-slate-600'}>STATUS: {actionStatus.toUpperCase()}</span>
                           </div>
                           {responseLog.length === 0 ? (
                               <div className="text-slate-700 italic mt-2">Ready for command input...</div>
                           ) : (
                               <div className="space-y-1 mt-2">
                                   {responseLog.map((log, i) => (
                                       <div key={i} className="text-primary-400 animate-fade-in">{log}</div>
                                   ))}
                                   {actionStatus === 'deploying' && <div className="w-2 h-4 bg-primary-500 animate-pulse inline-block align-middle ml-1"></div>}
                               </div>
                           )}
                       </div>

                       {/* Controls */}
                       <div className="w-full md:w-auto flex flex-col justify-between space-y-3 min-w-[200px]">
                           <button 
                               onClick={() => handleCounterMeasure('Truth Vector')}
                               disabled={actionStatus === 'deploying'}
                               className="flex-1 flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 group"
                           >
                               <span className="flex items-center"><MessageSquare className="w-4 h-4 mr-2 text-blue-400" /> Generate Rebuttal</span>
                               <CornerDownRight className="w-3 h-3 text-slate-600 group-hover:text-white" />
                           </button>
                           
                           <button 
                               onClick={() => handleCounterMeasure('Node Isolation')}
                               disabled={actionStatus === 'deploying'}
                               className="flex-1 flex items-center justify-between px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm font-bold text-red-400 transition-all disabled:opacity-50 group"
                           >
                               <span className="flex items-center"><ShieldAlert className="w-4 h-4 mr-2" /> Neutralize Node</span>
                               <Zap className="w-3 h-3 text-red-500/50 group-hover:text-red-500" />
                           </button>
                       </div>
                   </div>
               </div>
               </>
           )}
        </div>
      </div>
    </div>
  );
};