import React, { useState, useEffect } from 'react';
import { GeoRegion, AttackVector } from '../types';
import { analyzeGeoThreat } from '../services/geminiService';
import { Globe, AlertTriangle, Shield, Activity, Target, Zap, Server, MapPin, X, Radar, Radio } from 'lucide-react';

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
];

export const GeoAnalysis: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<GeoRegion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intelReport, setIntelReport] = useState<{riskAssessment: string; strategicImplications: string[]; stabilityScore: number} | null>(null);

  const getRegionColor = (level: string) => {
    switch(level) {
        case 'Critical': return '#ef4444'; // red
        case 'High': return '#f97316'; // orange
        case 'Moderate': return '#eab308'; // yellow
        default: return '#3b82f6'; // blue
    }
  };

  const handleRegionClick = async (region: GeoRegion) => {
    setSelectedRegion(region);
    setIntelReport(null);
    setIsAnalyzing(true);

    const vectors = MOCK_VECTORS.filter(v => v.targetRegionId === region.id).map(v => `${v.type} attack from ${MOCK_REGIONS.find(r => r.id === v.sourceRegionId)?.name}`);
    
    // Simulate delay for effect before calling or if no API key
    await new Promise(r => setTimeout(r, 1000));
    
    try {
        const report = await analyzeGeoThreat(region.name, region.activeCampaigns, region.dominantNarrative, vectors);
        setIntelReport(report);
    } catch (e) {
        // Fallback for demo
        setIntelReport({
            riskAssessment: "Simulated Report: Region shows elevated activity consistent with coordinated botnet deployment.",
            strategicImplications: ["Erosion of public trust", "Policy gridlock", "Social fragmentation"],
            stabilityScore: 65
        });
    }
    
    setIsAnalyzing(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 animate-fade-in pb-10">
      
      {/* Map Visualizer Area */}
      <div className="flex-1 glass-panel rounded-3xl relative overflow-hidden flex items-center justify-center bg-black/60 border-white/5 group shadow-2xl">
        
        {/* Abstract Map Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_0%,transparent_70%)] pointer-events-none"></div>

        {/* Interactive Map SVG */}
        <div className="relative w-full h-full max-w-5xl max-h-[600px] p-10 flex items-center justify-center">
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
              {MOCK_VECTORS.map((vector, i) => {
                  const source = MOCK_REGIONS.find(r => r.id === vector.sourceRegionId);
                  const target = MOCK_REGIONS.find(r => r.id === vector.targetRegionId);
                  if(!source || !target) return null;
                  
                  const midX = (source.coordinates.x + target.coordinates.x) / 2;
                  const midY = (source.coordinates.y + target.coordinates.y) / 2 - 80;

                  return (
                      <g key={vector.id}>
                          <path 
                             d={`M${source.coordinates.x},${source.coordinates.y} Q${midX},${midY} ${target.coordinates.x},${target.coordinates.y}`} 
                             fill="none" 
                             stroke={vector.type === 'State-Sponsored' ? '#ef4444' : '#a855f7'}
                             strokeWidth="2" 
                             strokeOpacity="0.3"
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
              {MOCK_REGIONS.map(region => (
                  <g 
                    key={region.id} 
                    onClick={() => handleRegionClick(region)} 
                    className="cursor-pointer group/node"
                  >
                      {/* Pulse Effect */}
                      <circle cx={region.coordinates.x} cy={region.coordinates.y} r="20" fill={getRegionColor(region.threatLevel)} opacity="0.1">
                         <animate attributeName="r" from="15" to="35" dur="3s" repeatCount="indefinite" />
                         <animate attributeName="opacity" from="0.3" to="0" dur="3s" repeatCount="indefinite" />
                      </circle>
                      
                      {/* Core Node */}
                      <circle cx={region.coordinates.x} cy={region.coordinates.y} r="8" fill={getRegionColor(region.threatLevel)} stroke="rgba(255,255,255,0.8)" strokeWidth="2" className="group-hover/node:fill-white transition-colors" />
                      
                      {/* Label Box */}
                      <rect x={region.coordinates.x - 40} y={region.coordinates.y + 15} width="80" height="25" rx="4" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <text x={region.coordinates.x} y={region.coordinates.y + 32} fill="white" fontSize="9" textAnchor="middle" fontWeight="bold" className="uppercase tracking-wider">
                          {region.name}
                      </text>
                  </g>
              ))}
           </svg>
        </div>

        {/* Overlay Stats */}
        <div className="absolute top-6 left-6 space-y-3">
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
                    <span className="text-white font-bold text-sm">{MOCK_VECTORS.length} Active</span>
                </div>
            </div>
        </div>
      </div>

      {/* Intelligence Sidebar */}
      <div className={`
        lg:w-96 glass-panel rounded-3xl border-white/5 flex flex-col transition-all duration-500 overflow-hidden shadow-2xl bg-black/80 backdrop-blur-xl
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
                            {/* Stability Gauge */}
                            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 shadow-inner">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Regional Stability</span>
                                    <span className={`text-xl font-mono font-bold ${intelReport.stabilityScore < 40 ? 'text-red-400' : 'text-green-400'}`}>{intelReport.stabilityScore}%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${intelReport.stabilityScore < 40 ? 'bg-red-500' : 'bg-green-500'}`} 
                                        style={{width: `${intelReport.stabilityScore}%`}}
                                    ></div>
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
                    <button className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Deploy Counter-Narrative</span>
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};