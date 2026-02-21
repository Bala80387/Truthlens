import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, LineChart, Line, Legend
} from 'recharts';
import { 
  AlertTriangle, TrendingUp, Users, ShieldCheck, Map, ArrowUpRight, Globe, Radio, 
  Activity, Search, Cpu, Zap, Brain, Database, Network, Lock, Eye, Terminal,
  Wifi, Server, Code, Layers, Disc
} from 'lucide-react';
import { View } from '../types';

interface DashboardProps {
  onAnalyzeTopic: (text: string) => void;
}

// --- MOCK DATA ---

const viralPredictionData = [
  { time: '00:00', actual: 4000, predicted: 4200, mitigation: 1200 },
  { time: '04:00', actual: 3000, predicted: 3500, mitigation: 2800 },
  { time: '08:00', actual: 2000, predicted: 2800, mitigation: 3500 },
  { time: '12:00', actual: 2780, predicted: 3908, mitigation: 3100 },
  { time: '16:00', actual: 1890, predicted: 4800, mitigation: 4200 },
  { time: '20:00', actual: 2390, predicted: 3800, mitigation: 3900 },
  { time: '23:59', actual: 3490, predicted: 4300, mitigation: 4500 },
];

const emotionalData = [
  { subject: 'Fear', A: 120, fullMark: 150 },
  { subject: 'Outrage', A: 98, fullMark: 150 },
  { subject: 'Hope', A: 45, fullMark: 150 },
  { subject: 'Trust', A: 30, fullMark: 150 },
  { subject: 'Curiosity', A: 65, fullMark: 150 },
  { subject: 'Disgust', A: 85, fullMark: 150 },
];

const sourceDistribution = [
  { name: 'Organic', value: 400, color: '#22c55e' },
  { name: 'Botnet', value: 300, color: '#ef4444' },
  { name: 'State Actor', value: 200, color: '#a855f7' },
  { name: 'Hybrid', value: 100, color: '#eab308' },
];

const activeAgents = [
    { id: 'A-01', name: 'Search-Bot-Alpha', status: 'Scanning', load: 85, task: 'Indexing' },
    { id: 'A-02', name: 'Verify-Node-Beta', status: 'Analyzing', load: 62, task: 'Fact-Check' },
    { id: 'A-03', name: 'Sentinel-Prime', status: 'Idle', load: 12, task: 'Standby' },
    { id: 'A-04', name: 'Deep-Trace-X', status: 'Mitigating', load: 94, task: 'DDoS Block' },
];

const MOCK_LIVE_FEED = [
    { platform: 'Twitter', text: 'Just saw a video of the president dancing on Mars! #Viral', status: 'Fake', confidence: 99, tech: 'ViT-B/16', agent: 'A-01' },
    { platform: 'Facebook', text: 'New health study confirms coffee extends life by 200 years.', status: 'Misleading', confidence: 85, tech: 'BERT-L', agent: 'A-02' },
    { platform: 'Reddit', text: 'Leaked documents from Area 51 showing alien soup recipes.', status: 'Satire', confidence: 92, tech: 'LSTM-Seq', agent: 'A-01' },
    { platform: 'News', text: 'Central Bank announces interest rate hike of 0.25%.', status: 'Real', confidence: 98, tech: 'BERT-Base', agent: 'A-03' },
    { platform: 'TikTok', text: 'Filter that shows your future soulmate is definitely scientific.', status: 'Fake', confidence: 95, tech: 'ViT-L/14', agent: 'A-04' },
    { platform: 'Telegram', text: 'Urgent: Water supply contaminated in sector 7.', status: 'Fake', confidence: 88, tech: 'Gemini-Pro', agent: 'A-02' },
    { platform: 'Bluesky', text: 'Tech giant merger approved by regulators.', status: 'Real', confidence: 91, tech: 'BERT-L', agent: 'A-01' }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 p-3 rounded-lg border border-white/10 shadow-xl backdrop-blur-md">
        <p className="text-slate-300 font-mono text-xs mb-1 border-b border-white/10 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-xs py-0.5">
             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }}></div>
             <span className="text-slate-400 capitalize">{entry.name}:</span>
             <span className="font-bold text-white font-mono">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ onAnalyzeTopic }) => {
  const [liveItems, setLiveItems] = useState<any[]>([]);
  const [systemLoad, setSystemLoad] = useState(45);
  const [timeRange, setTimeRange] = useState<'1H' | '24H' | '7D'>('24H');

  useEffect(() => {
    // Initial population
    setLiveItems(MOCK_LIVE_FEED.slice(0, 5).map(item => ({ ...item, id: Math.random(), time: new Date().toLocaleTimeString() })));

    const interval = setInterval(() => {
        const newItem = MOCK_LIVE_FEED[Math.floor(Math.random() * MOCK_LIVE_FEED.length)];
        const timestampedItem = { 
            ...newItem, 
            id: Date.now(), 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
        };
        setLiveItems(prev => [timestampedItem, ...prev].slice(0, 7));
        setSystemLoad(prev => Math.min(100, Math.max(20, prev + (Math.random() * 10 - 5))));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center">
             <Brain className="w-8 h-8 mr-3 text-primary-500" />
             Command Center
          </h2>
          <p className="text-slate-400 mt-2 font-mono text-sm flex items-center space-x-2">
             <span>AUTONOMOUS AGENT OVERSIGHT</span>
             <span className="text-slate-600">|</span>
             <span className="text-green-400">SYSTEM OPTIMAL</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
           {/* Time Range Selector */}
           <div className="flex bg-black/40 border border-white/10 rounded-lg p-1">
              {['1H', '24H', '7D'].map((range) => (
                <button 
                    key={range}
                    onClick={() => setTimeRange(range as any)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                        timeRange === range ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    {range}
                </button>
              ))}
           </div>
           
           <div className="h-8 w-px bg-white/10"></div>
           
           <div className="text-right">
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">System Load</span>
              <div className="flex items-center justify-end space-x-2">
                 <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${systemLoad > 80 ? 'bg-red-500' : 'bg-primary-500'}`} 
                        style={{width: `${systemLoad}%`}}
                    ></div>
                 </div>
                 <span className="text-sm font-mono text-white font-bold">{Math.round(systemLoad)}%</span>
              </div>
           </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Threat Index", value: "CRITICAL", sub: "Sector 4 Active", color: "text-red-500", icon: <AlertTriangle className="w-5 h-5" />, chart: true },
          { label: "Mitigation Rate", value: "94.2%", sub: "+2.1% this week", color: "text-blue-500", icon: <ShieldCheck className="w-5 h-5" />, chart: false },
          { label: "Avg Resolution", value: "1.4s", sub: "-0.2s latency", color: "text-purple-500", icon: <Zap className="w-5 h-5" />, chart: false },
          { label: "Knowledge Graph", value: "4.2M", sub: "Entities Linked", color: "text-green-500", icon: <Network className="w-5 h-5" />, chart: false },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-5 rounded-xl border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
             <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                <div className={`p-1.5 rounded-lg bg-white/5 ${stat.color} shadow-lg shadow-white/5`}>{stat.icon}</div>
             </div>
             <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
             <div className={`text-[10px] font-bold mt-1 uppercase ${stat.color}`}>{stat.sub}</div>
             {stat.chart && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500/20">
                   <div className="h-full bg-red-500 w-[70%] animate-pulse"></div>
                </div>
             )}
          </div>
        ))}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Virality Prediction Model */}
         <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-white/5 bg-black/40">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-500/10 rounded-lg border border-primary-500/20">
                    <Activity className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-none">Viral Misinformation Growth Forecast</h3>
                    <span className="text-xs text-slate-500">AI Prediction vs Real-time Spread</span>
                  </div>
               </div>
               <div className="flex items-center space-x-4 text-xs">
                  <span className="flex items-center text-slate-400"><div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div> Predicted</span>
                  <span className="flex items-center text-slate-400"><div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div> Actual</span>
                  <span className="flex items-center text-slate-400"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div> Mitigated</span>
               </div>
            </div>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={viralPredictionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMitigation" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                     <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                     <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                     <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                     <Area type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPredicted)" />
                     <Area type="monotone" dataKey="actual" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
                     <Area type="monotone" dataKey="mitigation" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorMitigation)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Emotional Spectrum Analysis */}
         <div className="glass-panel p-6 rounded-2xl border-white/5 bg-black/40">
            <div className="flex items-center space-x-3 mb-2">
               <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                 <Eye className="w-5 h-5 text-purple-400" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-white leading-none">Sentiment Radar</h3>
                  <span className="text-xs text-slate-500">Emotional Fingerprint Analysis</span>
               </div>
            </div>
            
            <div className="h-[280px] w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={emotionalData}>
                     <PolarGrid stroke="rgba(255,255,255,0.1)" />
                     <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                     <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                     <Radar name="Threat Sentiment" dataKey="A" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.3} />
                     <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
               </ResponsiveContainer>
               <div className="absolute bottom-0 w-full text-center">
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full uppercase tracking-wider">Dominant: FEAR</span>
               </div>
            </div>
         </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         
         {/* Active Counter-Measures (New Section) */}
         <div className="glass-panel p-6 rounded-2xl border-white/5 bg-black/40">
             <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                   <Layers className="w-5 h-5 text-green-400" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-white leading-none">Active Agents</h3>
                   <span className="text-xs text-slate-500">Autonomous Counter-Measures</span>
                </div>
             </div>
             
             <div className="space-y-3">
                 {activeAgents.map(agent => (
                     <div key={agent.id} className="bg-white/5 rounded-xl p-3 flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors">
                         <div className="flex items-center space-x-3">
                             <div className={`w-2 h-2 rounded-full ${agent.status === 'Scanning' ? 'bg-blue-500 animate-pulse' : agent.status === 'Mitigating' ? 'bg-red-500 animate-pulse' : agent.status === 'Analyzing' ? 'bg-purple-500' : 'bg-slate-500'}`}></div>
                             <div>
                                 <div className="text-sm font-bold text-white">{agent.name}</div>
                                 <div className="text-[10px] text-slate-500 font-mono uppercase">{agent.task}</div>
                             </div>
                         </div>
                         <div className="text-right">
                             <div className="text-xs font-mono text-primary-400">{agent.load}%</div>
                             <div className="w-16 h-1 bg-slate-800 rounded-full mt-1">
                                 <div className="h-full bg-primary-500 rounded-full" style={{width: `${agent.load}%`}}></div>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
         </div>

         {/* Source Attribution */}
         <div className="glass-panel p-6 rounded-2xl border-white/5 bg-black/40">
            <div className="flex items-center space-x-3 mb-6">
               <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <Database className="w-5 h-5 text-orange-400" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-white leading-none">Attribution</h3>
                  <span className="text-xs text-slate-500">Traffic Source Distribution</span>
               </div>
            </div>
            <div className="flex items-center">
               <div className="h-[200px] w-[200px] flex-shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={sourceDistribution}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {sourceDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" />
                           ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <span className="text-2xl font-black text-white">40%</span>
                  </div>
               </div>
               <div className="flex-1 pl-4 space-y-3">
                  {sourceDistribution.map((item, i) => (
                     <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center">
                           <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: item.color}}></div>
                           <span className="text-slate-300">{item.name}</span>
                        </div>
                        <span className="font-bold text-white">{Math.round((item.value / 1000) * 100)}%</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Agent Activity Log (Live) */}
         <div className="glass-panel p-6 rounded-2xl border-white/5 bg-black/40 flex flex-col">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Terminal className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-none">Live Threat Intelligence</h3>
                    <span className="text-xs text-slate-500">Real-time Misinformation Feed</span>
                  </div>
               </div>
               <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-green-400 font-mono">PROCESSING</span>
               </div>
            </div>
            
            <div className="flex-1 overflow-hidden relative min-h-[200px] bg-black/40 rounded-xl border border-white/5 p-1 font-mono">
               <div className="absolute inset-0 space-y-1 p-2 overflow-y-auto custom-scrollbar">
                  {liveItems.map((item) => (
                     <div key={item.id} onClick={() => onAnalyzeTopic(item.text)} className="group flex items-start p-2 rounded hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0">
                        <div className="flex flex-col space-y-1 w-full">
                            <div className="flex justify-between items-center text-[10px] text-slate-500">
                                <span>[{item.time}]</span>
                                <span className="text-primary-500">{item.agent}</span>
                            </div>
                            <div className="text-[11px] text-slate-300 group-hover:text-white transition-colors truncate">
                                <span className="text-green-500 mr-2">$</span>
                                {item.text}
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                  item.status === 'Real' ? 'text-green-400 bg-green-500/10' : 
                                  item.status === 'Fake' ? 'text-red-400 bg-red-500/10' : 'text-orange-400 bg-orange-500/10'
                                }`}>{item.status}</span>
                                <span className="text-[9px] text-slate-600">{item.tech}</span>
                            </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

// Helper component for KPI icons (Target icon not imported from lucide in original code, custom SVG here)
function Target(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}