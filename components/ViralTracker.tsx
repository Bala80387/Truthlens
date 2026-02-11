import React, { useState, useEffect } from 'react';
import { ViralTrend, ViralSource } from '../types';
import { analyzeUserRisk } from '../services/geminiService';
import { Globe, Crosshair, Users, Activity, Radio, AlertTriangle, ShieldAlert, MapPin, Database, Server, Fingerprint, Lock, Share2, Network } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// Mock Data for Simulation
const MOCK_SOURCES: ViralSource[] = [
  { id: 'u1', handle: '@patriot_eagle_99', avatar: 'bg-red-500', platform: 'Twitter', accountAge: '2 months', followers: 15400, credibilityScore: 12, botProbability: 88, location: 'St. Petersburg, RU', networkCluster: 'State-Sponsored', recentFlags: 45 },
  { id: 'u2', handle: '@crypto_king_x', avatar: 'bg-purple-500', platform: 'Telegram', accountAge: '1 year', followers: 89000, credibilityScore: 25, botProbability: 60, location: 'Unknown Proxy', networkCluster: 'Botnet', recentFlags: 12 },
  { id: 'u3', handle: '@sarah_news_daily', avatar: 'bg-green-500', platform: 'Facebook', accountAge: '5 years', followers: 4200, credibilityScore: 85, botProbability: 5, location: 'Ohio, USA', networkCluster: 'Organic', recentFlags: 1 },
  { id: 'u4', handle: '@freedom_front', avatar: 'bg-blue-500', platform: 'TikTok', accountAge: '3 weeks', followers: 250000, credibilityScore: 8, botProbability: 95, location: 'VPN Node', networkCluster: 'Political', recentFlags: 120 },
];

const MOCK_TOPICS = [
  "Election ballots found in river",
  "Central Bank digital currency mandated",
  "Celebrity deepfake scandal leaked",
  "New virus strain detected in water supply",
  "Tech CEO arrested for alien contact"
];

// Simple node graph generator
const generateNodes = (centerId: string, count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `node-${i}`,
        x: 50 + Math.cos((i / count) * 2 * Math.PI) * 35 + (Math.random() * 10 - 5),
        y: 50 + Math.sin((i / count) * 2 * Math.PI) * 35 + (Math.random() * 10 - 5),
        size: Math.random() * 3 + 2,
        color: Math.random() > 0.8 ? '#ef4444' : '#3b82f6'
    }));
};

export const ViralTracker: React.FC = () => {
  const [activeTrends, setActiveTrends] = useState<ViralTrend[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<ViralTrend | null>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [analysisData, setAnalysisData] = useState<{credibilityScore: number, botProbability: number} | null>(null);
  const [networkNodes, setNetworkNodes] = useState<any[]>([]);

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

      setActiveTrends(prev => [newTrend, ...prev].slice(0, 10));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleTraceSource = async (trend: ViralTrend) => {
    setSelectedTrend(trend);
    setIsTracing(true);
    setAnalysisData(null);
    setNetworkNodes([]);
    
    // Simulate API latency for effect
    await new Promise(r => setTimeout(r, 1500));
    
    // Call Gemini to analyze the user (Simulated input for this demo, in prod would be real profile data)
    const analysis = await analyzeUserRisk(
        trend.sourceUser.handle,
        "Account posts exclusively about polarizing political topics. High frequency posting schedule (24/7). Profile image is generic/AI generated.",
        ["BREAKING: They don't want you to know this!", "Share before deleted!", trend.topic]
    );

    setAnalysisData(analysis);
    setNetworkNodes(generateNodes(trend.id, 12)); // Generate mock nodes for visualization
    setIsTracing(false);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12 h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
           <h2 className="text-4xl font-extrabold text-white tracking-tight flex items-center">
             <Crosshair className="w-8 h-8 mr-3 text-red-500 animate-pulse" />
             Viral Threat Tracker
           </h2>
           <p className="text-slate-400 mt-2">Real-time identification of misinformation vectors and source profiling.</p>
        </div>
        <div className="flex items-center space-x-4">
           <div className="glass-panel px-4 py-2 rounded-full flex items-center space-x-2 border-red-500/30 bg-red-500/10">
              <Activity className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-red-400 font-mono font-bold">{activeTrends.reduce((acc, t) => acc + t.volume, 0).toLocaleString()} EVENTS/MIN</span>
           </div>
           <div className="glass-panel px-4 py-2 rounded-full flex items-center space-x-2 border-primary-500/30 bg-primary-500/10">
              <Database className="w-4 h-4 text-primary-400" />
              <span className="text-primary-400 font-mono font-bold">DB: CONNECTED</span>
           </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Left Panel: Live Feed */}
        <div className="glass-panel rounded-3xl border-white/10 flex flex-col overflow-hidden bg-black/40">
           <div className="p-5 border-b border-white/10 bg-black/40 flex justify-between items-center sticky top-0 backdrop-blur-md z-10">
              <h3 className="font-bold text-white flex items-center">
                <Radio className="w-4 h-4 mr-2 text-green-400 animate-pulse" /> Live Ingestion
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">LATENCY: 42ms</span>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
              {activeTrends.map(trend => (
                <div 
                  key={trend.id}
                  onClick={() => handleTraceSource(trend)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:translate-x-1 group relative overflow-hidden ${
                    selectedTrend?.id === trend.id 
                    ? 'bg-primary-500/10 border-primary-500/50 shadow-[0_0_15px_rgba(14,165,233,0.1)]' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                   {selectedTrend?.id === trend.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>}
                   <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        trend.status === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-orange-500/20 text-orange-400 border border-orange-500/20'
                      }`}>
                        {trend.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(trend.timestamp).toLocaleTimeString()}</span>
                   </div>
                   <h4 className="text-sm font-bold text-white mb-2 leading-tight group-hover:text-primary-300 transition-colors">{trend.topic}</h4>
                   <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center"><Activity className="w-3 h-3 mr-1" /> {trend.velocity}% Growth</span>
                      <span className="font-mono text-white">{trend.volume} vol</span>
                   </div>
                </div>
              ))}
              {activeTrends.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 flex-col">
                   <Server className="w-8 h-8 mb-2 opacity-50" />
                   <span className="text-xs tracking-widest uppercase">Waiting for stream...</span>
                </div>
              )}
           </div>
        </div>

        {/* Right Panel: Source Profiler */}
        <div className="lg:col-span-2 glass-panel rounded-3xl border-white/10 flex flex-col relative overflow-hidden bg-black/60">
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
              <div className="flex-1 p-8 relative z-10 overflow-y-auto">
                 {/* Profile Header */}
                 <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-8 border-b border-white/10">
                    <div className="flex items-center space-x-6">
                       <div className="relative">
                           <div className={`w-24 h-24 rounded-2xl ${selectedTrend.sourceUser.avatar} shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center border border-white/10 relative z-10`}>
                              <Users className="w-10 h-10 text-white/50" />
                           </div>
                           <div className="absolute -inset-2 bg-white/5 rounded-3xl blur-xl -z-0"></div>
                       </div>
                       <div>
                          <div className="flex items-center space-x-3 mb-1">
                             <h2 className="text-3xl font-black text-white tracking-tight">{selectedTrend.sourceUser.handle}</h2>
                             <span className="px-2 py-0.5 rounded bg-slate-800 border border-white/10 text-xs font-mono text-slate-400">{selectedTrend.sourceUser.platform}</span>
                          </div>
                          <p className="text-slate-400 flex items-center mb-3">
                             <MapPin className="w-3 h-3 mr-1" /> {selectedTrend.sourceUser.location}
                          </p>
                          <div className="flex space-x-4 text-sm">
                             <div className="flex flex-col">
                                <span className="font-bold text-white">{selectedTrend.sourceUser.followers.toLocaleString()}</span>
                                <span className="text-slate-500 text-xs uppercase">Followers</span>
                             </div>
                             <div className="w-px bg-white/10"></div>
                             <div className="flex flex-col">
                                <span className="font-bold text-white">{selectedTrend.sourceUser.accountAge}</span>
                                <span className="text-slate-500 text-xs uppercase">Age</span>
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="mt-6 md:mt-0 flex flex-col items-end">
                       <div className="text-right mb-2">
                          <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider">Network Cluster</span>
                          <span className={`text-lg font-bold ${
                             selectedTrend.sourceUser.networkCluster === 'Organic' ? 'text-green-400' : 'text-red-400'
                          }`}>{selectedTrend.sourceUser.networkCluster.toUpperCase()}</span>
                       </div>
                       <div className="bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-lg flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-red-400 font-bold text-sm">{selectedTrend.sourceUser.recentFlags} Recent Flags</span>
                       </div>
                    </div>
                 </div>

                 {/* Metrics Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Bot Probability */}
                    <div className="glass-panel p-6 rounded-2xl border-white/5 bg-black/40">
                       <div className="flex justify-between items-center mb-4">
                          <h4 className="text-slate-300 font-bold flex items-center">
                             <Server className="w-4 h-4 mr-2 text-purple-400" /> Bot Probability
                          </h4>
                          <span className="text-2xl font-mono text-white font-bold">{analysisData?.botProbability || selectedTrend.sourceUser.botProbability}%</span>
                       </div>
                       <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000" 
                             style={{width: `${analysisData?.botProbability || selectedTrend.sourceUser.botProbability}%`}}
                          ></div>
                       </div>
                       <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                          Analysis of posting frequency, syntax repetition, and API interaction patterns suggests high automation likelihood.
                       </p>
                    </div>

                    {/* Credibility Score */}
                    <div className="glass-panel p-6 rounded-2xl border-white/5 bg-black/40">
                       <div className="flex justify-between items-center mb-4">
                          <h4 className="text-slate-300 font-bold flex items-center">
                             <ShieldAlert className="w-4 h-4 mr-2 text-green-400" /> Trust Score
                          </h4>
                          <span className={`text-2xl font-mono font-bold ${
                             (analysisData?.credibilityScore || selectedTrend.sourceUser.credibilityScore) > 50 ? 'text-green-400' : 'text-red-400'
                          }`}>{analysisData?.credibilityScore || selectedTrend.sourceUser.credibilityScore}/100</span>
                       </div>
                       <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className={`h-full transition-all duration-1000 ${
                                (analysisData?.credibilityScore || selectedTrend.sourceUser.credibilityScore) > 50 ? 'bg-green-500' : 'bg-red-500'
                             }`} 
                             style={{width: `${analysisData?.credibilityScore || selectedTrend.sourceUser.credibilityScore}%`}}
                          ></div>
                       </div>
                       <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                          Based on cross-referencing past claims against verified fact-checking databases and domain reputation.
                       </p>
                    </div>
                 </div>
                 
                 {/* Network Graph Visualization */}
                 <div className="glass-panel p-6 rounded-2xl border-white/5 bg-black/40 mb-8 relative overflow-hidden">
                    <div className="flex items-center space-x-2 mb-4 relative z-10">
                        <Network className="w-4 h-4 text-primary-400" />
                        <h4 className="text-white font-bold">Botnet Cluster Visualization</h4>
                    </div>
                    <div className="h-48 w-full border border-white/10 rounded-xl bg-black/60 relative flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full">
                            {networkNodes.map((node, i) => (
                                <g key={i}>
                                    {/* Line to center */}
                                    <line x1="50%" y1="50%" x2={`${node.x}%`} y2={`${node.y}%`} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                    {/* Node */}
                                    <circle cx={`${node.x}%`} cy={`${node.y}%`} r={node.size} fill={node.color} className="animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
                                </g>
                            ))}
                            <circle cx="50%" cy="50%" r="6" fill="#fff" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                        </svg>
                        <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 font-mono">
                            NODES: {networkNodes.length} // DENSITY: HIGH
                        </div>
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="grid grid-cols-2 gap-4">
                     <button className="py-4 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors border border-white/5 flex items-center justify-center">
                        <Database className="w-4 h-4 mr-2" /> View Historical Data
                     </button>
                     <button className="py-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center">
                        <Lock className="w-4 h-4 mr-2" /> Freeze Account / Report
                     </button>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};