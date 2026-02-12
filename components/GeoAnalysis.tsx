import React, { useState, useEffect } from 'react';
import { GeoRegion, AttackVector } from '../types';
import { analyzeGeoThreat } from '../services/geminiService';
import { Globe, AlertTriangle, Shield, Activity, Target, Zap, Server, MapPin, X, Radar, Radio, Filter, CheckCircle, Lock, TrendingUp, Terminal, Users, FileText, ChevronRight, Hash, Sword, Eye, Calendar, User, Fingerprint, Network, Cpu } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip, CartesianGrid } from 'recharts';

const MOCK_REGIONS: GeoRegion[] = [
  { id: 'na', name: 'North America', threatLevel: 'Moderate', activeCampaigns: 12, dominantNarrative: 'Election Integrity', coordinates: { x: 200, y: 150 } },
  { id: 'sa', name: 'South America', threatLevel: 'Low', activeCampaigns: 4, dominantNarrative: 'Economic Reform', coordinates: { x: 280, y: 350 } },
  { id: 'eu', name: 'Europe', threatLevel: 'High', activeCampaigns: 28, dominantNarrative: 'Migration Crisis', coordinates: { x: 450, y: 140 } },
  { id: 'as', name: 'Asia', threatLevel: 'Critical', activeCampaigns: 45, dominantNarrative: 'Territorial Disputes', coordinates: { x: 650, y: 180 } },
  { id: 'af', name: 'Africa', threatLevel: 'Moderate', activeCampaigns: 15, dominantNarrative: 'Health Misinformation', coordinates: { x: 480, y: 280 } },
  { id: 'au', name: 'Oceania', threatLevel: 'Low', activeCampaigns: 3, dominantNarrative: 'Climate Policy', coordinates: { x: 750, y: 350 } },
];

const MOCK_VECTORS: AttackVector[] = [
    { id: 'v1', sourceRegionId: 'eu', targetRegionId: 'na', volume: 85, type: 'Botnet' },
    { id: 'v2', sourceRegionId: 'as', targetRegionId: 'na', volume: 60, type: 'State-Sponsored' },
    { id: 'v3', sourceRegionId: 'as', targetRegionId: 'eu', volume: 90, type: 'State-Sponsored' },
    { id: 'v4', sourceRegionId: 'na', targetRegionId: 'sa', volume: 40, type: 'Organic' },
    { id: 'v5', sourceRegionId: 'eu', targetRegionId: 'af', volume: 55, type: 'Botnet' },
    { id: 'v6', sourceRegionId: 'na', targetRegionId: 'as', volume: 30, type: 'Organic' },
    { id: 'v7', sourceRegionId: 'as', targetRegionId: 'au', volume: 70, type: 'Botnet' },
];

const TICKER_ITEMS = [
    "INTERCEPTED: Encrypted payload from Server Farm Alpha [Sector 7]",
    "ALERT: Abnormal traffic spike in sector EU-West detected by sentinel node",
    "SIGNAL: Deepfake signature matching 'Lazarus' group found in broadcast stream",
    "TRACE: Botnet C&C server identified in unmapped zone 44X",
    "STATUS: Global firewall integrity holding at 98.4%",
    "INFO: New narrative vector 'Project Blue' emerging in social graph"
];

// Simulated External Intelligence Feed (No API Quota Usage)
const DETAILED_THREAT_INTEL: Record<string, Array<{ name: string; type: string; tactics: string[]; activity: string }>> = {
  'North America': [
    { name: "APT-29 (Cozy Bear)", type: "State-Sponsored", tactics: ["Spearphishing", "Cloud Exploitation"], activity: "Targeting diplomatic entities via compromised O365." },
    { name: "Carbon Spider", type: "Financially Motivated", tactics: ["Ransomware", "Access Brokerage"], activity: "Shift to targeting hospitality sector." }
  ],
  'South America': [
    { name: "Lapsus$", type: "Extortion Group", tactics: ["Insider Threat", "Social Engineering"], activity: "High-profile data leaks from telecom." },
    { name: "Blind Eagle", type: "APT", tactics: ["Phishing", "RATs"], activity: "Targeting government institutions in Andes region." }
  ],
  'Europe': [
    { name: "Sandworm", type: "State-Sponsored", tactics: ["Wiper Malware", "OT Attacks"], activity: "Disruptive operations against energy grids." },
    { name: "Doppelgänger", type: "Disinformation", tactics: ["Typosquatting", "Fake Fact-Checks"], activity: "Active campaign spreading anti-migration narratives." }
  ],
  'Asia': [
    { name: "Lazarus Group", type: "State-Sponsored", tactics: ["Crypto Theft", "Social Engineering"], activity: "Funding generation via DeFi exploits." },
    { name: "Mustang Panda", type: "APT", tactics: ["USB Propagation", "PlugX Malware"], activity: "Espionage targeting NGOs and government." }
  ],
  'Africa': [
    { name: "Billbug", type: "Espionage", tactics: ["Cert. Spoofing", "Backdoors"], activity: "Targeting foreign exchange and taxation agencies." },
    { name: "MoustachedBouncer", type: "Surveillance", tactics: ["AiTM", "ISP Injection"], activity: "Intercepting traffic from embassies." }
  ],
  'Oceania': [
    { name: "Gelsemium", type: "APT", tactics: ["Supply Chain", "Web Shells"], activity: "Reconnaissance on academic institutions." },
    { name: "Bluebottle", type: "Cybercriminal", tactics: ["Banking Trojans"], activity: "Targeting financial sector with new loader." }
  ]
};

interface ReportDetail {
  title: string;
  date: string;
  id: string;
  author: string;
  classification: string;
  summary: string;
  keyFindings: string[];
  indicators: string[];
}

interface ActorProfile {
    name: string;
    type: string;
    tactics: string[];
    activity: string;
    aliases: string[];
    origin: string;
    tools: string[];
    targetedSectors: string[];
    relatedReports: { title: string; date: string }[];
}

export const GeoAnalysis: React.FC = () => {
  const [regions, setRegions] = useState<GeoRegion[]>(MOCK_REGIONS);
  const [selectedRegion, setSelectedRegion] = useState<GeoRegion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intelReport, setIntelReport] = useState<{
      riskAssessment: string; 
      strategicImplications: string[]; 
      stabilityScore: number;
      threatActors: string[];
      recentReports: {title: string, date: string}[];
  } | null>(null);
  const [trendData, setTrendData] = useState<{time: number, value: number}[]>([]);
  
  // UI States
  const [activeFilters, setActiveFilters] = useState<string[]>(['Botnet', 'State-Sponsored', 'Organic']);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'active'>('idle');

  // Report Modal States
  const [viewingReport, setViewingReport] = useState<ReportDetail | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<string | null>(null);
  
  // Actor Modal States
  const [viewingActor, setViewingActor] = useState<ActorProfile | null>(null);

  // Ticker Animation
  useEffect(() => {
    const timer = setInterval(() => {
        setTickerIndex(prev => (prev + 1) % TICKER_ITEMS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Simulation Effect for Active Region (Foreground)
  useEffect(() => {
    if (!selectedRegion) return;

    const interval = setInterval(() => {
        // Update Region Data
        setSelectedRegion(prev => {
            if (!prev) return null;

            // Fluctuate campaigns randomly (-2 to +2)
            const campaignChange = Math.floor(Math.random() * 5) - 2;
            const newCampaigns = Math.max(1, prev.activeCampaigns + campaignChange);

            // Fluctuate threat level (10% chance)
            let newThreatLevel = prev.threatLevel;
            if (Math.random() > 0.90) {
                 const levels: ('Low' | 'Moderate' | 'High' | 'Critical')[] = ['Low', 'Moderate', 'High', 'Critical'];
                 const idx = levels.indexOf(prev.threatLevel);
                 const move = Math.random() > 0.5 ? 1 : -1;
                 const newIdx = Math.max(0, Math.min(3, idx + move));
                 newThreatLevel = levels[newIdx];
            }

            // Update Narrative Context (25% chance)
            let newNarrative = prev.dominantNarrative;
            if (Math.random() > 0.75) {
                const base = prev.dominantNarrative.split(' [')[0];
                const states = ['[Trending]', '[Spiking]', '[Contained]', '[Viral]', '[Mutating]', ''];
                const newState = states[Math.floor(Math.random() * states.length)];
                newNarrative = newState ? `${base} ${newState}` : base;
            }

            const updated = {
                ...prev,
                activeCampaigns: newCampaigns,
                threatLevel: newThreatLevel,
                dominantNarrative: newNarrative
            };

            // Sync with map view immediately
            setRegions(currentRegions => 
              currentRegions.map(r => r.id === updated.id ? updated : r)
            );

            return updated;
        });

        // Update Charts & Stability Score
        setIntelReport(prev => {
            if (!prev) return null;
            // Stability correlates inversely with threat level changes simulated above
            // But here we just add noise for the visual chart
            const fluctuation = Math.floor(Math.random() * 7) - 3;
            const newScore = Math.max(0, Math.min(100, prev.stabilityScore + fluctuation));
            
            // Push new data point to trend chart
            setTrendData(currentTrend => {
                 if (currentTrend.length === 0) return currentTrend;
                 const lastTime = currentTrend[currentTrend.length - 1].time;
                 const newData = [...currentTrend.slice(1), { time: lastTime + 1, value: newScore }];
                 return newData;
            });

            return {
                ...prev,
                stabilityScore: newScore
            };
        });

    }, 2000);

    return () => clearInterval(interval);
  }, [selectedRegion?.id]);

  // Background Simulation for Unselected Regions
  useEffect(() => {
    const interval = setInterval(() => {
        setRegions(currentRegions => {
            return currentRegions.map(region => {
                // Skip the currently selected region (it is handled by the foreground effect)
                if (selectedRegion && region.id === selectedRegion.id) return region;

                // 1. Gradual Campaign Drift (Simulates organic growth/decay)
                if (Math.random() > 0.7) {
                    const drift = Math.random() > 0.5 ? 1 : -1;
                    const newCampaigns = Math.max(1, region.activeCampaigns + drift);
                    
                    // 2. Conditional Threat Level Shift (Reactive to campaigns)
                    const levels: ('Low' | 'Moderate' | 'High' | 'Critical')[] = ['Low', 'Moderate', 'High', 'Critical'];
                    let currentIdx = levels.indexOf(region.threatLevel);
                    
                    // Define thresholds for "natural" threat levels based on volume
                    let targetIdx = currentIdx;
                    if (newCampaigns < 8) targetIdx = 0; // Low
                    else if (newCampaigns < 20) targetIdx = 1; // Moderate
                    else if (newCampaigns < 35) targetIdx = 2; // High
                    else targetIdx = 3; // Critical
                    
                    // Only move one step at a time towards the target to prevent jumping
                    let newLevel = region.threatLevel;
                    if (currentIdx !== targetIdx) {
                        // 20% chance to correct the level to match volume (simulates lag/inertia)
                        if (Math.random() > 0.8) {
                            currentIdx += (targetIdx > currentIdx ? 1 : -1);
                            newLevel = levels[currentIdx];
                        }
                    } else {
                        // Rare random fluctuation even if stable (5% chance)
                        if (Math.random() > 0.95) {
                             const randomMove = Math.random() > 0.5 ? 1 : -1;
                             const newIdx = Math.max(0, Math.min(3, currentIdx + randomMove));
                             newLevel = levels[newIdx];
                        }
                    }

                    // 3. Narrative Evolution (Adds depth)
                    let newNarrative = region.dominantNarrative;
                    if (Math.random() > 0.9) {
                        const base = region.dominantNarrative.split(' [')[0];
                        const modifiers = ['[Emerging]', '[Complex]', '[Dormant]', '[Accelerating]', ''];
                        const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
                        newNarrative = mod ? `${base} ${mod}` : base;
                    }

                    return {
                        ...region,
                        activeCampaigns: newCampaigns,
                        threatLevel: newLevel,
                        dominantNarrative: newNarrative
                    };
                }
                
                return region;
            });
        });
    }, 3000); // Slower, more deliberate pace for background

    return () => clearInterval(interval);
  }, [selectedRegion?.id]);

  const toggleFilter = (type: string) => {
    if (activeFilters.includes(type)) {
        setActiveFilters(prev => prev.filter(f => f !== type));
    } else {
        setActiveFilters(prev => [...prev, type]);
    }
  };

  const getRegionColor = (level: string) => {
    switch(level) {
        case 'Critical': return '#ef4444'; // red
        case 'High': return '#f97316'; // orange
        case 'Moderate': return '#eab308'; // yellow
        default: return '#3b82f6'; // blue
    }
  };
  
  const getPulseDuration = (campaigns: number) => {
      // More campaigns = faster pulse. Range approx 1s to 4s.
      // Cap campaigns at 50 for max speed calculation.
      const speed = Math.max(1, 4 - (campaigns / 15));
      return `${speed}s`;
  };

  const handleRegionClick = async (region: GeoRegion) => {
    setSelectedRegion(region);
    setIntelReport(null);
    setIsAnalyzing(true);
    setDeployStatus('idle');

    // Generate dynamic mock trend data for visual variety
    const baseStability = region.threatLevel === 'Critical' ? 30 : region.threatLevel === 'High' ? 50 : 80;
    const newTrendData = Array.from({ length: 20 }, (_, i) => ({
        time: i,
        value: Math.max(0, Math.min(100, baseStability + (Math.random() * 20 - 10)))
    }));
    setTrendData(newTrendData);

    const vectors = MOCK_VECTORS.filter(v => v.targetRegionId === region.id).map(v => `${v.type} attack from ${regions.find(r => r.id === v.sourceRegionId)?.name || 'Unknown'}`);
    
    // Simulate delay for effect before calling
    await new Promise(r => setTimeout(r, 1000));
    
    try {
        const report = await analyzeGeoThreat(region.name, region.activeCampaigns, region.dominantNarrative, vectors);
        setIntelReport(report);
    } catch (e) {
        // Fallback for demo
        setIntelReport({
            riskAssessment: "Simulated Report: Region shows elevated activity consistent with coordinated botnet deployment targeting election infrastructure.",
            strategicImplications: ["Erosion of public trust in verified media", "Policy gridlock due to polarized narratives", "Social fragmentation in key demographics"],
            stabilityScore: baseStability,
            threatActors: ["APT-29", "Lazarus Group", "Local Insurgents"],
            recentReports: [
                { title: "Sector 7 Vulnerability Assessment", date: "2023-10-12" },
                { title: "Botnet Traffic Analysis: Q3", date: "2023-09-28" }
            ]
        });
    }
    
    setIsAnalyzing(false);
  };

  const handleOpenReport = async (report: {title: string, date: string}) => {
      setIsLoadingReport(report.title);
      // Simulate fetch delay
      await new Promise(r => setTimeout(r, 1500));
      
      const detailedReport: ReportDetail = {
          title: report.title,
          date: report.date,
          id: `INTEL-${Math.floor(Math.random() * 10000)}`,
          author: "Unit 8200 - Cyber Intelligence",
          classification: "TOP SECRET // NOFORN",
          summary: "This intelligence intercept indicates a coordinated effort to leverage localized botnets for narrative shaping. Traffic analysis shows signature patterns consistent with state-aligned actors attempting to destabilize key infrastructure nodes.",
          keyFindings: [
              "Lateral movement detected in 42% of targeted subnets.",
              "Payload delivery via encrypted social channels (Telegram/WhatsApp).",
              "Use of 'sleeper' accounts aged > 2 years to bypass standard filters."
          ],
          indicators: [
              "IP: 192.168.104.22 (Malicious Node)",
              "Hash: 5d41402abc4b2a76b9719d911017c592",
              "Domain: secure-verify-login-update.com"
          ]
      };
      
      setViewingReport(detailedReport);
      setIsLoadingReport(null);
  };
  
  const handleActorClick = (actor: any) => {
    // Generate deterministic mock profile based on actor name
    const id = actor.name.length;
    
    const aliases = ["ShadowBroker", "Red October", "Equation Group", "Fancy Bear", "Charming Kitten"].filter((_, i) => (id + i) % 2 === 0);
    const tools = ["Cobalt Strike", "Mimikatz", "PlugX", "PoisonIvy", "Custom RAT"].filter((_, i) => (id + i) % 3 === 0);
    const sectors = ["Defense", "Energy", "Finance", "Healthcare", "Government"].filter((_, i) => (id + i) % 2 === 0);
    
    const extendedActor: ActorProfile = {
        name: actor.name,
        type: actor.type,
        tactics: actor.tactics,
        activity: actor.activity,
        aliases: aliases.length ? aliases : ["Unknown"],
        origin: selectedRegion?.name === 'Asia' ? 'East Asia' : selectedRegion?.name === 'Europe' ? 'Eastern Europe' : 'Unknown',
        tools: tools.length ? tools : ["Proprietary Malware"],
        targetedSectors: sectors.length ? sectors : ["Critical Infrastructure"],
        relatedReports: [
            { title: `Analysis of ${actor.name} Infrastructure`, date: "2023-11-05" },
            { title: "Zero-day Exploit Linked to Group", date: "2023-08-12" }
        ]
    };
    setViewingActor(extendedActor);
  };

  const handleDeploy = () => {
    setDeployStatus('deploying');
    setTimeout(() => {
        setDeployStatus('active');
    }, 2500);
  };

  const visibleVectors = MOCK_VECTORS.filter(v => activeFilters.includes(v.type));

  const currentThreatActors = selectedRegion 
    ? (DETAILED_THREAT_INTEL[selectedRegion.name] || DETAILED_THREAT_INTEL['North America'])
    : [];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 animate-fade-in pb-10 relative">
      
      {/* Map Visualizer Area */}
      <div className="flex-1 glass-panel rounded-3xl relative overflow-hidden flex items-center justify-center bg-black/60 border-white/5 group shadow-2xl flex-col">
        
        {/* Abstract Map Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_0%,transparent_70%)] pointer-events-none"></div>
        
        {/* Scanning Line Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-[2px] bg-primary-500/30 shadow-[0_0_15px_rgba(14,165,233,0.5)] animate-[scan_4s_linear_infinite]"></div>
        </div>

        {/* Interactive Map SVG */}
        <div className="relative w-full flex-1 p-10 flex items-center justify-center">
           <svg viewBox="0 0 900 500" className="w-full h-full drop-shadow-[0_0_30px_rgba(14,165,233,0.2)]">
              
              {/* Simplified World Map Paths (Stylized) */}
              <g className="opacity-40">
                <path d="M50,50 L250,50 L280,180 L180,250 L80,200 Z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" /> {/* NA Approximation */}
                <path d="M220,260 L320,260 L300,450 L240,400 Z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" /> {/* SA Approximation */}
                <path d="M400,60 L550,60 L580,180 L480,200 L420,150 Z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" /> {/* EU Approximation */}
                <path d="M420,220 L580,220 L550,400 L450,350 Z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" /> {/* AF Approximation */}
                <path d="M600,60 L850,60 L820,250 L650,250 Z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" /> {/* AS Approximation */}
                <path d="M700,300 L850,300 L820,450 L680,400 Z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" /> {/* AU Approximation */}
              </g>

              {/* Attack Vectors (Animated Bezier Curves) */}
              {visibleVectors.map((vector, i) => {
                  const source = regions.find(r => r.id === vector.sourceRegionId);
                  const target = regions.find(r => r.id === vector.targetRegionId);
                  if(!source || !target) return null;
                  
                  const midX = (source.coordinates.x + target.coordinates.x) / 2;
                  const midY = (source.coordinates.y + target.coordinates.y) / 2 - 80;
                  
                  const color = vector.type === 'State-Sponsored' ? '#ef4444' : vector.type === 'Botnet' ? '#a855f7' : '#22c55e';

                  return (
                      <g key={vector.id}>
                          <path 
                             d={`M${source.coordinates.x},${source.coordinates.y} Q${midX},${midY} ${target.coordinates.x},${target.coordinates.y}`} 
                             fill="none" 
                             stroke={color}
                             strokeWidth="1.5" 
                             strokeOpacity="0.4"
                             strokeDasharray="4,4"
                          >
                             <animate attributeName="stroke-dashoffset" from="100" to="0" dur={`${3 - (vector.volume/100)}s`} repeatCount="indefinite" />
                          </path>
                          <circle r="3" fill="#fff">
                             <animateMotion dur={`${3 - (vector.volume/100)}s`} repeatCount="indefinite" path={`M${source.coordinates.x},${source.coordinates.y} Q${midX},${midY} ${target.coordinates.x},${target.coordinates.y}`} />
                          </circle>
                      </g>
                  );
              })}

              {/* Region Nodes */}
              {regions.map(region => (
                  <g 
                    key={region.id} 
                    onClick={() => handleRegionClick(region)} 
                    className="cursor-pointer group/node"
                  >
                      {/* Pulse Effect */}
                      <circle cx={region.coordinates.x} cy={region.coordinates.y} r="20" fill={getRegionColor(region.threatLevel)} opacity="0.1">
                         <animate attributeName="r" from="15" to="35" dur={`${getPulseDuration(region.activeCampaigns)}`} repeatCount="indefinite" />
                         <animate attributeName="opacity" from="0.3" to="0" dur={`${getPulseDuration(region.activeCampaigns)}`} repeatCount="indefinite" />
                      </circle>
                      
                      {/* Core Node */}
                      <circle cx={region.coordinates.x} cy={region.coordinates.y} r="6" fill={getRegionColor(region.threatLevel)} stroke="rgba(255,255,255,0.8)" strokeWidth="2" className="group-hover/node:fill-white transition-colors" />
                      
                      {/* Label Box */}
                      <foreignObject x={region.coordinates.x - 50} y={region.coordinates.y + 12} width="100" height="40">
                          <div className="flex flex-col items-center">
                             <span className="bg-black/70 border border-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm uppercase tracking-wider">{region.name}</span>
                          </div>
                      </foreignObject>
                  </g>
              ))}
           </svg>
        </div>

        {/* Top Overlay Controls */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none">
            {/* Stats */}
            <div className="space-y-3 pointer-events-auto">
                <div className="glass-panel px-4 py-3 rounded-xl border-white/10 bg-black/80 flex items-center space-x-3 backdrop-blur-xl">
                    <Globe className="w-5 h-5 text-primary-400" />
                    <div>
                        <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Global Status</span>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-white font-bold text-sm">DEFCON 4</span>
                        </div>
                    </div>
                </div>
                <div className="glass-panel px-4 py-3 rounded-xl border-white/10 bg-black/80 flex items-center space-x-3 backdrop-blur-xl">
                    <Radar className="w-5 h-5 text-green-400" />
                    <div>
                        <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Vectors</span>
                        <span className="text-white font-bold text-sm">{visibleVectors.length} Active</span>
                    </div>
                </div>
            </div>

            {/* Filter Toggles */}
            <div className="glass-panel p-2 rounded-xl border-white/10 bg-black/80 backdrop-blur-xl pointer-events-auto flex flex-col space-y-2">
                <div className="flex items-center space-x-2 px-2 pb-1 border-b border-white/10 mb-1">
                    <Filter className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Filters</span>
                </div>
                {[
                    { id: 'Botnet', label: 'Botnets', color: 'bg-purple-500' },
                    { id: 'State-Sponsored', label: 'State Actors', color: 'bg-red-500' },
                    { id: 'Organic', label: 'Organic', color: 'bg-green-500' }
                ].map(filter => (
                    <button 
                        key={filter.id}
                        onClick={() => toggleFilter(filter.id)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            activeFilters.includes(filter.id) 
                            ? 'bg-white/10 text-white' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${activeFilters.includes(filter.id) ? filter.color : 'bg-slate-600'}`}></div>
                        <span>{filter.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Live Ticker */}
        <div className="w-full bg-black/80 border-t border-white/10 p-2 overflow-hidden flex items-center backdrop-blur-xl">
            <div className="flex-shrink-0 px-3 border-r border-white/10 mr-3 flex items-center space-x-2 text-primary-400">
                <Terminal className="w-3 h-3" />
                <span className="text-[10px] font-bold font-mono">LIVE_FEED</span>
            </div>
            <div className="flex-1 font-mono text-xs text-slate-300 truncate">
                <span className="animate-pulse mr-2 text-primary-500">>>></span>
                {TICKER_ITEMS[tickerIndex]}
            </div>
        </div>
      </div>

      {/* Intelligence Sidebar */}
      <div className={`
        lg:w-96 glass-panel rounded-3xl border-white/5 flex flex-col transition-all duration-500 overflow-hidden shadow-2xl bg-black/80 backdrop-blur-xl relative z-10
        ${selectedRegion ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-50 pointer-events-none lg:pointer-events-auto lg:translate-x-0 lg:opacity-100'}
      `}>
        {!selectedRegion ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                    <Globe className="w-10 h-10 opacity-30" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Tactical Command</h3>
                <p className="text-sm">Select a regional node to initialize sectoral analysis and threat vector breakdown.</p>
            </div>
        ) : (
            <div className="flex-1 flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/10 rounded-full blur-xl -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight">{selectedRegion.name}</h2>
                            <p className="text-xs text-primary-400 uppercase tracking-widest mt-1 font-bold flex items-center">
                                <Radio className="w-3 h-3 mr-1" /> Sector Active
                            </p>
                        </div>
                        <button onClick={() => setSelectedRegion(null)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <div className="flex items-center space-x-2 relative z-10">
                        <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase border shadow-lg ${
                            selectedRegion.threatLevel === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/10' : 
                            selectedRegion.threatLevel === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-orange-500/10' : 
                            'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-blue-500/10'
                        }`}>
                            Threat: {selectedRegion.threatLevel}
                        </span>
                        <div className="h-4 w-px bg-white/10"></div>
                        <span className="text-xs text-slate-300 flex items-center font-mono">
                            <Target className="w-3 h-3 mr-1 text-slate-500" /> {selectedRegion.activeCampaigns} VECTORS
                        </span>
                    </div>
                </div>

                {/* Intel Content */}
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center h-40 space-y-4">
                            <div className="relative">
                                <div className="w-12 h-12 border-2 border-primary-500/30 rounded-full"></div>
                                <div className="absolute inset-0 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-xs text-primary-400 font-mono animate-pulse tracking-widest">DECRYPTING INTEL STREAM...</p>
                        </div>
                    ) : intelReport ? (
                        <>
                            {/* Stability Chart */}
                            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center">
                                        <TrendingUp className="w-3 h-3 mr-1" /> Historical Instability
                                    </span>
                                    <span className={`text-sm font-mono font-bold ${intelReport.stabilityScore < 40 ? 'text-red-400' : 'text-green-400'}`}>{intelReport.stabilityScore}%</span>
                                </div>
                                <div className="h-24 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorStability" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={intelReport.stabilityScore < 40 ? "#ef4444" : "#22c55e"} stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor={intelReport.stabilityScore < 40 ? "#ef4444" : "#22c55e"} stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}
                                                itemStyle={{ color: '#fff' }}
                                                labelStyle={{ display: 'none' }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="value" 
                                                stroke={intelReport.stabilityScore < 40 ? "#ef4444" : "#22c55e"} 
                                                fillOpacity={1} 
                                                fill="url(#colorStability)" 
                                                strokeWidth={2}
                                            />
                                            <YAxis hide domain={[0, 100]} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Risk Assessment */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-primary-400 uppercase flex items-center tracking-wider">
                                    <Activity className="w-4 h-4 mr-2" /> Situation Report
                                </h4>
                                <div className="text-sm text-slate-300 leading-relaxed p-4 bg-primary-900/10 border border-primary-500/10 rounded-xl">
                                    {intelReport.riskAssessment}
                                </div>
                            </div>

                             {/* Primary Threat Actors - Enhanced */}
                             <div className="space-y-3">
                                <h4 className="text-xs font-bold text-red-400 uppercase flex items-center tracking-wider">
                                    <Users className="w-4 h-4 mr-2" /> Primary Threat Actors
                                </h4>
                                <div className="space-y-3">
                                    {currentThreatActors.map((actor: any, i: number) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handleActorClick(actor)}
                                            className="w-full text-left bg-red-500/5 border border-red-500/10 p-3 rounded-xl hover:bg-red-500/10 transition-colors group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm font-bold text-red-300 flex items-center group-hover:text-red-200">
                                                    <Target className="w-3 h-3 mr-2" /> {actor.name}
                                                </span>
                                                <span className="text-[10px] bg-red-500/10 px-2 py-0.5 rounded text-red-400 border border-red-500/20 uppercase font-bold">{actor.type}</span>
                                            </div>
                                            <div className="space-y-2 pl-5 border-l-2 border-red-500/20">
                                                <div className="flex flex-col items-start text-xs text-slate-400">
                                                    <span className="text-slate-500 uppercase text-[10px] font-bold mb-0.5">Known Tactics</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {actor.tactics.map((t: string, idx: number) => (
                                                            <span key={idx} className="bg-black/40 px-1.5 py-0.5 rounded text-slate-300 border border-white/5">{t}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-start text-xs text-slate-400">
                                                    <span className="text-slate-500 uppercase text-[10px] font-bold mb-0.5">Recent Activity</span>
                                                    <span className="text-slate-300 italic">"{actor.activity}"</span>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex justify-end">
                                                <span className="text-[10px] text-red-400/70 font-bold uppercase tracking-wide group-hover:text-red-400 flex items-center">
                                                    View Dossier <ChevronRight className="w-3 h-3 ml-1" />
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Implications */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-purple-400 uppercase flex items-center tracking-wider">
                                    <Zap className="w-4 h-4 mr-2" /> Strategic Impact
                                </h4>
                                <ul className="space-y-2">
                                    {intelReport.strategicImplications.map((imp, i) => (
                                        <li key={i} className="text-xs text-slate-400 flex items-start p-2 rounded hover:bg-white/5 transition-colors">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-3 flex-shrink-0 shadow-[0_0_5px_rgba(168,85,247,0.8)]"></span>
                                            {imp}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Inbound Vectors */}
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <h4 className="text-[10px] text-slate-500 font-bold uppercase mb-3 tracking-widest">Dominant Narrative</h4>
                                <div className="flex items-center space-x-3 text-white bg-white/5 p-3 rounded-xl border border-white/5">
                                    <Server className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm font-medium">"{selectedRegion.dominantNarrative}"</span>
                                </div>
                            </div>
                            
                            {/* Recent Analysis Reports */}
                            <div className="mt-2 space-y-3">
                                <h4 className="text-xs font-bold text-blue-400 uppercase flex items-center tracking-wider">
                                    <FileText className="w-4 h-4 mr-2" /> Related Intelligence
                                </h4>
                                <div className="space-y-2">
                                    {intelReport.recentReports.map((report, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handleOpenReport(report)}
                                            className="w-full text-left bg-black/40 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/10 p-3 rounded-lg group transition-all"
                                        >
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-bold text-slate-300 group-hover:text-white line-clamp-1">
                                                    {isLoadingReport === report.title ? (
                                                        <span className="animate-pulse text-blue-400">ACCESSING DATABASE...</span>
                                                    ) : report.title}
                                                </span>
                                                <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400" />
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-mono mt-1 block">{report.date}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-slate-500 py-10">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">Intel generation failed. Try again.</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                    {deployStatus === 'idle' ? (
                        <button 
                            onClick={handleDeploy}
                            className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center space-x-2 group"
                        >
                            <Shield className="w-4 h-4 group-hover:text-primary-600 transition-colors" />
                            <span>Deploy Counter-Narrative</span>
                        </button>
                    ) : deployStatus === 'deploying' ? (
                        <button className="w-full py-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm flex items-center justify-center space-x-2 cursor-wait">
                            <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                            <span>Initializing Assets...</span>
                        </button>
                    ) : (
                        <button className="w-full py-4 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 font-bold text-sm flex items-center justify-center space-x-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Counter-Measures Active</span>
                        </button>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* Threat Actor Profile Modal */}
      {viewingActor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setViewingActor(null)}></div>
              <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-red-500/30 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                  
                  {/* Header */}
                  <div className="p-6 border-b border-white/10 bg-gradient-to-r from-red-950/30 to-transparent relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                      <div className="flex justify-between items-start">
                          <div>
                              <div className="flex items-center space-x-2 mb-2">
                                  <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm">High Value Target</span>
                                  <span className="text-[10px] text-red-400 font-mono uppercase tracking-widest">ID: {viewingActor.name.substring(0,3).toUpperCase()}-{Math.floor(Math.random()*1000)}</span>
                              </div>
                              <h2 className="text-2xl font-black text-white leading-tight mb-1">{viewingActor.name}</h2>
                              <div className="flex items-center space-x-2 text-sm text-slate-400">
                                  <span>{viewingActor.type}</span>
                                  <span className="text-slate-600">|</span>
                                  <span className="flex items-center"><Globe className="w-3 h-3 mr-1" /> {viewingActor.origin}</span>
                              </div>
                          </div>
                          <button onClick={() => setViewingActor(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                              <X className="w-5 h-5" />
                          </button>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      
                      {/* Aliases */}
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                              <Fingerprint className="w-3 h-3 mr-2" /> Known Aliases
                          </h4>
                          <div className="flex flex-wrap gap-2">
                              {viewingActor.aliases.map((alias, i) => (
                                  <span key={i} className="text-sm font-mono text-white bg-black/40 px-2 py-1 rounded border border-white/10">{alias}</span>
                              ))}
                          </div>
                      </div>

                      {/* Toolset & Tactics */}
                      <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                                    <Cpu className="w-3 h-3 mr-2" /> Toolset
                                </h4>
                                <ul className="space-y-1">
                                    {viewingActor.tools.map((tool, i) => (
                                        <li key={i} className="text-xs text-red-300 flex items-center">
                                            <span className="w-1 h-1 rounded-full bg-red-500 mr-2"></span> {tool}
                                        </li>
                                    ))}
                                </ul>
                           </div>
                           <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                                    <Target className="w-3 h-3 mr-2" /> Targets
                                </h4>
                                <ul className="space-y-1">
                                    {viewingActor.targetedSectors.map((sector, i) => (
                                        <li key={i} className="text-xs text-slate-300 flex items-center">
                                            <span className="w-1 h-1 rounded-full bg-slate-500 mr-2"></span> {sector}
                                        </li>
                                    ))}
                                </ul>
                           </div>
                      </div>
                      
                      {/* Recent Activity */}
                      <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                              <Activity className="w-3 h-3 mr-2" /> Recent Activity
                          </h4>
                          <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                              <p className="text-sm text-slate-300 leading-relaxed italic">"{viewingActor.activity}"</p>
                              <div className="mt-3 flex gap-2 flex-wrap">
                                  {viewingActor.tactics.map((t, i) => (
                                      <span key={i} className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 uppercase">{t}</span>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* Related Intel */}
                      <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                              <FileText className="w-3 h-3 mr-2" /> Linked Intelligence
                          </h4>
                          <div className="space-y-2">
                              {viewingActor.relatedReports.map((rep, i) => (
                                  <div key={i} className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                                      <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{rep.title}</span>
                                      <span className="text-[10px] text-slate-600 font-mono">{rep.date}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Report Modal */}
      {viewingReport && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setViewingReport(null)}></div>
              <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                  
                  {/* Top Secret Header */}
                  <div className="h-2 bg-red-600 w-full"></div>
                  <div className="p-6 border-b border-white/10 flex justify-between items-start bg-red-950/10">
                      <div>
                          <div className="flex items-center space-x-3 mb-2">
                              <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm">Top Secret</span>
                              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{viewingReport.classification}</span>
                          </div>
                          <h2 className="text-xl font-bold text-white leading-tight">{viewingReport.title}</h2>
                      </div>
                      <button onClick={() => setViewingReport(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 font-mono text-sm space-y-8">
                      {/* Meta Data Grid */}
                      <div className="grid grid-cols-2 gap-6 pb-6 border-b border-dashed border-white/10">
                          <div>
                              <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Generated By</span>
                              <div className="flex items-center space-x-2 text-primary-400 font-bold">
                                  <User className="w-3 h-3" />
                                  <span>{viewingReport.author}</span>
                              </div>
                          </div>
                          <div>
                              <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Date Logged</span>
                              <div className="flex items-center space-x-2 text-slate-300">
                                  <Calendar className="w-3 h-3" />
                                  <span>{viewingReport.date}</span>
                              </div>
                          </div>
                          <div>
                              <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1">Reference ID</span>
                              <div className="flex items-center space-x-2 text-slate-300">
                                  <Hash className="w-3 h-3" />
                                  <span>{viewingReport.id}</span>
                              </div>
                          </div>
                      </div>

                      {/* Summary Section */}
                      <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                              <Eye className="w-4 h-4 mr-2" /> Executive Summary
                          </h4>
                          <p className="text-slate-300 leading-relaxed p-4 bg-white/5 rounded-lg border-l-2 border-primary-500">
                              {viewingReport.summary}
                          </p>
                      </div>

                      {/* Key Findings */}
                      <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                              <Target className="w-4 h-4 mr-2" /> Key Findings
                          </h4>
                          <ul className="space-y-2">
                              {viewingReport.keyFindings.map((finding, i) => (
                                  <li key={i} className="flex items-start text-slate-300">
                                      <span className="mr-3 text-slate-600 mt-1">0{i+1}.</span>
                                      <span>{finding}</span>
                                  </li>
                              ))}
                          </ul>
                      </div>

                      {/* IOCs */}
                      <div className="space-y-3">
                          <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center">
                              <Lock className="w-4 h-4 mr-2" /> Indicators of Compromise (IOC)
                          </h4>
                          <div className="bg-black border border-red-900/30 p-4 rounded-lg space-y-2">
                              {viewingReport.indicators.map((ioc, i) => (
                                  <div key={i} className="flex items-center text-xs font-mono text-red-300/80 border-b border-red-900/10 pb-1 last:border-0 last:pb-0">
                                      <Terminal className="w-3 h-3 mr-2 opacity-50" />
                                      {ioc}
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-slate-600 font-mono">AUTHORIZED EYES ONLY</span>
                      <button className="text-xs font-bold text-primary-400 hover:text-primary-300 flex items-center space-x-2">
                          <FileText className="w-3 h-3" />
                          <span>Export PDF</span>
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};