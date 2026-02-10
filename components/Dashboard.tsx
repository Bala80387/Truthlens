import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Users, ShieldCheck, Map, ArrowUpRight, Globe, Radio, Activity, Search } from 'lucide-react';
import { View } from '../types';

interface DashboardProps {
  onAnalyzeTopic: (text: string) => void;
}

const trendData = [
  { time: '08:00', fake: 12, verified: 45 },
  { time: '10:00', fake: 19, verified: 52 },
  { time: '12:00', fake: 35, verified: 48 },
  { time: '14:00', fake: 22, verified: 60 },
  { time: '16:00', fake: 48, verified: 55 },
  { time: '18:00', fake: 65, verified: 70 },
  { time: '20:00', fake: 40, verified: 85 },
];

const categoryData = [
  { name: 'Politics', value: 65, color: '#ef4444' },
  { name: 'Health', value: 45, color: '#f97316' },
  { name: 'Finance', value: 30, color: '#eab308' },
  { name: 'Tech', value: 25, color: '#3b82f6' },
  { name: 'Crime', value: 15, color: '#a855f7' },
];

const MOCK_LIVE_FEED = [
    { platform: 'Twitter', text: 'Just saw a video of the president dancing on Mars! #Viral', status: 'Fake', confidence: 99 },
    { platform: 'Facebook', text: 'New health study confirms coffee extends life by 200 years.', status: 'Misleading', confidence: 85 },
    { platform: 'Reddit', text: 'Leaked documents from Area 51 showing alien soup recipes.', status: 'Satire', confidence: 92 },
    { platform: 'News', text: 'Central Bank announces interest rate hike of 0.25%.', status: 'Real', confidence: 98 },
    { platform: 'TikTok', text: 'Filter that shows your future soulmate is definitely scientific.', status: 'Fake', confidence: 95 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 p-4 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md">
        <p className="text-slate-200 font-bold mb-2 text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-xs mb-1">
             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
             <span className="text-slate-300">{entry.name}:</span>
             <span className="font-mono text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ onAnalyzeTopic }) => {
  const [liveItems, setLiveItems] = useState<any[]>([]);

  // Simulate real-time ingestion
  useEffect(() => {
    const interval = setInterval(() => {
        const newItem = MOCK_LIVE_FEED[Math.floor(Math.random() * MOCK_LIVE_FEED.length)];
        const timestampedItem = { ...newItem, id: Date.now(), time: new Date().toLocaleTimeString() };
        setLiveItems(prev => [timestampedItem, ...prev].slice(0, 6));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">Command Center</h2>
          <p className="text-slate-400 mt-2 flex items-center">
            <Globe className="w-4 h-4 mr-2 text-primary-500" />
            Global Misinformation Threat Level: <span className="text-orange-400 font-bold ml-2">MODERATE</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="glass-panel px-4 py-2 rounded-full text-xs text-green-400 flex items-center border-green-500/20 bg-green-500/5 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
            <Radio className="w-3 h-3 mr-2 animate-pulse text-red-500" />
            Real-Time Monitoring Active
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Active Threats", value: "1,248", icon: <AlertTriangle className="w-6 h-6" />, color: "text-red-400", sub: "↑ 12% Spike", bgGlow: "bg-red-500/10" },
          { title: "Verification Rate", value: "89.2%", icon: <TrendingUp className="w-6 h-6" />, color: "text-primary-400", sub: "1.2s Latency", bgGlow: "bg-primary-500/10" },
          { title: "Debunked", value: "452", icon: <ShieldCheck className="w-6 h-6" />, color: "text-green-400", sub: "Today", bgGlow: "bg-green-500/10" },
          { title: "Reports", value: "85", icon: <Users className="w-6 h-6" />, color: "text-purple-400", sub: "Pending", bgGlow: "bg-purple-500/10" }
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${stat.bgGlow}`}></div>
            <div className="relative z-10">
              <div className={`flex items-center justify-between mb-4 ${stat.color}`}>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">{stat.icon}</div>
                <ArrowUpRight className="w-4 h-4 opacity-50" />
              </div>
              <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
              <div className="flex items-center justify-between mt-2">
                 <span className="text-sm font-medium text-slate-400">{stat.title}</span>
                 <span className={`text-xs font-bold ${stat.color}`}>{stat.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-white/5">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-bold text-white">Threat Velocity</h3>
             <select className="bg-black/50 border border-white/10 text-xs text-slate-300 rounded-lg px-3 py-1 outline-none focus:border-primary-500">
               <option>Last 24 Hours</option>
               <option>Last 7 Days</option>
             </select>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorFake" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="time" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="fake" name="Threats" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorFake)" />
                <Area type="monotone" dataKey="verified" name="Verified" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorVerified)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-white/5">
          <h3 className="text-lg font-bold text-white mb-8">Narrative Categories</h3>
          <div className="h-[320px] w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" barSize={24}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       {/* Heatmap & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col">
           <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Geographic Origin</h3>
            <div className="flex space-x-2">
               <span className="w-2 h-2 rounded-full bg-red-500"></span>
               <span className="text-xs text-slate-400">Hotspots</span>
            </div>
           </div>
           <div className="flex-1 min-h-[250px] w-full flex items-center justify-center bg-black/40 rounded-xl border border-white/5 relative overflow-hidden group">
              {/* Abstract decorative map representation */}
              <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000">
                 <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-red-500/20 rounded-full blur-[80px] animate-pulse-slow"></div>
                 <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-orange-500/20 rounded-full blur-[80px] animate-pulse-slow" style={{animationDelay: '1s'}}></div>
                 <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-500/10 rounded-full blur-[60px]"></div>
              </div>
              <Map className="w-12 h-12 text-slate-600 opacity-20" />
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest absolute bottom-4 left-4">Data Visualization Active</p>
           </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-white/5 flex flex-col">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Live Ingestion Stream</h3>
              <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-green-400 font-mono">WS_CONNECTED</span>
              </div>
           </div>
           
           <div className="space-y-3 flex-1 overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none z-10"></div>
             {liveItems.map((item) => (
               <div 
                  key={item.id} 
                  onClick={() => onAnalyzeTopic(item.text)}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group animate-fade-in"
                >
                 <div className="flex-1 min-w-0 mr-4">
                     <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-black/50 uppercase">{item.platform}</span>
                        <span className="text-[10px] text-slate-500">{item.time}</span>
                     </div>
                     <p className="text-xs text-slate-200 truncate font-mono">{item.text}</p>
                 </div>
                 
                 <div className="flex flex-col items-end flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                         item.status === 'Real' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                         item.status === 'Fake' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                         'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}>
                        {item.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">{item.confidence}% Conf.</span>
                 </div>
               </div>
             ))}
           </div>
           
           <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
               <button className="text-xs text-primary-400 flex items-center hover:text-white transition-colors">
                   <Activity className="w-3 h-3 mr-1" />
                   View Full Monitoring Logs
               </button>
           </div>
        </div>
      </div>
    </div>
  );
};
