import React, { useState, useEffect } from 'react';
import { GeoRegion, AttackVector } from '../types';
import { analyzeGeoThreat } from '../services/geminiService';
import { Globe, AlertTriangle, Shield, Activity, Target, Zap, Server, MapPin, X } from 'lucide-react';

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
  const [mapScale, setMapScale] = useState(1);

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
    
    const report = await analyzeGeoThreat(region.name, region.activeCampaigns, region.dominantNarrative, vectors);
    setIntelReport(report);
    setIsAnalyzing(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 animate-fade-in pb-10">
      
      {/* Map Visualizer Area */}
      <div className="flex-1 glass-panel rounded-3xl relative overflow-hidden flex items-center justify-center bg-black/40 border-white/5 group">
        
        {/* Abstract Map Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-primary-900/10 pointer-events-none"></div>

        {/* Interactive Map SVG */}
        <div className="relative w-full h-full max-w-5xl max-h-[600px] p-10">
           <svg viewBox="0 0 900 500" className="w-full h-full drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              
              {/* Simplified World Map Paths (Stylized) */}
              <path d="M50,50 L250,50 L280,180 L180,250 L80,200 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" className="hover:fill-white/10 transition-colors" /> {/* NA Approximation */}
              <path d="M220,260 L320,260 L300,450 L240,400 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" className="hover:fill-white/10 transition-colors" /> {/* SA Approximation */}
              <path d="M400,60 L550,60 L580,180 L480,200 L420,150 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" className="hover:fill-white/10 transition-colors" /> {/* EU Approximation */}
              <path d="M420,220 L580,220 L550,400 L450,350 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" className="hover:fill-white/10 transition-colors" /> {/* AF Approximation */}
              <path d="M600,60 L850,60 L820,250 L650,250 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" className="hover:fill-white/10 transition-colors" /> {/* AS Approximation */}
              <path d="M700,300 L850,300 L820,450 L680,400 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" className="hover:fill-white/10 transition-colors" /> {/* AU Approximation */}

              {/* Attack Vectors (Animated Bezier Curves) */}
              {MOCK_VECTORS.map((vector, i) => {
                  const source = MOCK_REGIONS.find(r => r.id === vector.sourceRegionId);
                  const target = MOCK_REGIONS.find(r => r.id === vector.targetRegionId);
                  if(!source || !target) return null;
                  
                  // Calculate curve control point for arc effect
                  const midX = (source.coordinates.x + target.coordinates.x) / 2;
                  const midY = (source.coordinates.y + target.coordinates.y) / 2 - 50; // Arc upwards

                  return (
                      <g key={vector.id}>
                          <path 
                             d={`M${source.coordinates.x},${source.coordinates.y} Q${midX},${midY} ${target.coordinates.x},${target.coordinates.y}`} 
                             fill="none" 
                             stroke={vector.type === 'State-Sponsored' ? '#ef4444' : '#a855f7'}
                             strokeWidth={vector.volume / 30} 
                             strokeOpacity="0.4"
                             strokeDasharray="5,5"
                          >
                             <animate attributeName="stroke-dashoffset" from="100" to="0" dur={`${3 - (vector.volume/100)}s`} repeatCount="indefinite" />
                          </path>
                          <circle r="3" fill={vector.type === 'State-Sponsored' ? '#ef4444' : '#a855f7'}>
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
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                      {/* Pulse Effect */}
                      <circle cx={region.coordinates.x} cy={region.coordinates.y} r="15" fill={getRegionColor(region.threatLevel)} opacity="0.2">
                         <animate attributeName="r" from="10" to="30" dur="2s" repeatCount="indefinite" />
                         <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                      
                      {/* Core Node */}
                      <circle cx={region.coordinates.x} cy={region.coordinates.y} r="6" fill={getRegionColor(region.threatLevel)} stroke="#fff" strokeWidth="2" />
                      
                      {/* Label */}
                      <text x={region.coordinates.x} y={region.coordinates.y + 25} fill="white" fontSize="10" textAnchor="middle" fontWeight="bold" className="uppercase tracking-wider shadow-sm">
                          {region.name}
                      </text>

                      {/* Stats Label */}
                      <text x={region.coordinates.x} y={region.coordinates.y + 38} fill="rgba(255,255,255,0.6)" fontSize="8" textAnchor="middle">
                          {region.activeCampaigns} Active Threats
                      </text>
                  </g>
              ))}
           </svg>
        </div>

        {/* Overlay Stats */}
        <div className="absolute top-6 left-6 flex space-x-4">
            <div className="glass-panel px-4 py-2 rounded-lg border-white/10 bg-black/50">
                <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider">Global Threat Level</span>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-white font-bold">ELEVATED</span>
                </div>
            </div>
            <div className="glass-panel px-4 py-2 rounded-lg border-white/10 bg-black/50">
                <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider">Active Botnets</span>
                <span className="text-white font-bold">14 Detected</span>
            </div>
        </div>
      </div>

      {/* Intelligence Sidebar */}
      <div className={`
        lg:w-96 glass-panel rounded-3xl border-white/5 flex flex-col transition-all duration-500 overflow-hidden
        ${selectedRegion ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-50 pointer-events-none lg:pointer-events-auto lg:translate-x-0 lg:opacity-100'}
      `}>
        {!selectedRegion ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <Globe className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-white mb-2">Geo-Spatial Intelligence</h3>
                <p className="text-sm">Select a region on the command map to generate a strategic situation report and analyze viral vectors.</p>
            </div>
        ) : (
            <div className="flex-1 flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-black/20">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-black text-white">{selectedRegion.name}</h2>
                            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Sector Analysis</p>
                        </div>
                        <button onClick={() => setSelectedRegion(null)} className="p-1 hover:bg-white/10 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            selectedRegion.threatLevel === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                            selectedRegion.threatLevel === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 
                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                            Threat: {selectedRegion.threatLevel}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center">
                            <Target className="w-3 h-3 mr-1" /> {selectedRegion.activeCampaigns} Vectors
                        </span>
                    </div>
                </div>

                {/* Intel Content */}
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center h-40 space-y-4">
                            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-primary-400 font-mono animate-pulse">DECRYPTING SIGNAL PATTERNS...</p>
                        </div>
                    ) : intelReport ? (
                        <>
                            {/* Stability Gauge */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-slate-400 font-bold uppercase">Regional Stability</span>
                                    <span className="text-lg font-mono font-bold text-white">{intelReport.stabilityScore}/100</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${intelReport.stabilityScore < 40 ? 'bg-red-500' : 'bg-green-500'}`} 
                                        style={{width: `${intelReport.stabilityScore}%`}}
                                    ></div>
                                </div>
                            </div>

                            {/* Risk Assessment */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-primary-400 uppercase flex items-center">
                                    <Activity className="w-4 h-4 mr-2" /> Situation Report
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed p-3 bg-primary-500/5 border border-primary-500/10 rounded-lg">
                                    {intelReport.riskAssessment}
                                </p>
                            </div>

                            {/* Implications */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-purple-400 uppercase flex items-center">
                                    <Zap className="w-4 h-4 mr-2" /> Strategic Impact
                                </h4>
                                <ul className="space-y-2">
                                    {intelReport.strategicImplications.map((imp, i) => (
                                        <li key={i} className="text-xs text-slate-400 flex items-start">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2 flex-shrink-0"></span>
                                            {imp}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Inbound Vectors */}
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <h4 className="text-xs text-slate-500 font-bold uppercase mb-3">Dominant Narrative</h4>
                                <div className="flex items-center space-x-2 text-white">
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
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-900/20 hover:scale-[1.02] transition-transform flex items-center justify-center">
                        <Shield className="w-4 h-4 mr-2" /> Deploy Counter-Narrative
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};