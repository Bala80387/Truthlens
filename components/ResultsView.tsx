import React from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Share2, Shield, Eye, ThumbsDown, Activity, ChevronRight, Lock } from 'lucide-react';

interface ResultsViewProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onReset }) => {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Real': return 'text-green-400 border-green-500/50 bg-green-500/5 shadow-[0_0_30px_rgba(34,197,94,0.1)]';
      case 'Fake': return 'text-red-400 border-red-500/50 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]';
      case 'Misleading': return 'text-orange-400 border-orange-500/50 bg-orange-500/5 shadow-[0_0_30px_rgba(249,115,22,0.1)]';
      case 'Satire': return 'text-purple-400 border-purple-500/50 bg-purple-500/5 shadow-[0_0_30px_rgba(168,85,247,0.1)]';
      default: return 'text-slate-400 border-slate-500/50 bg-slate-500/5';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Real': return <CheckCircle className="w-16 h-16" />;
      case 'Fake': return <XCircle className="w-16 h-16" />;
      case 'Misleading': return <AlertTriangle className="w-16 h-16" />;
      case 'Satire': return <Eye className="w-16 h-16" />;
      default: return <HelpCircle className="w-16 h-16" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <button onClick={onReset} className="mb-6 text-slate-400 hover:text-white transition-colors flex items-center group">
        <div className="bg-white/5 p-2 rounded-lg mr-2 group-hover:bg-white/10 transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" />
        </div>
        Back to Engine
      </button>

      {/* Main Verdict Card */}
      <div className={`glass-panel rounded-3xl p-10 mb-8 text-center border ${getStatusColor(result.classification).split(' ')[1]} ${getStatusColor(result.classification).split(' ')[3]} relative overflow-hidden`}>
        {/* Scanning grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="mb-6 relative">
                 <div className={`absolute inset-0 blur-3xl opacity-20 ${result.classification === 'Real' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                 {getStatusIcon(result.classification)}
            </div>
          
            <h2 className={`text-6xl font-black tracking-tighter mb-4 ${getStatusColor(result.classification).split(' ')[0]}`}>{result.classification.toUpperCase()}</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">{result.summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 w-full max-w-3xl">
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                    <span className="text-3xl font-bold text-white mb-1">{result.confidence}%</span>
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">AI Confidence</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                    <span className={`text-3xl font-bold mb-1 ${result.viralityScore > 70 ? 'text-red-400' : 'text-slate-200'}`}>
                        {result.viralityScore}<span className="text-sm text-slate-500">/100</span>
                    </span>
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Virality Index</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                    <span className={`text-3xl font-bold mb-1 ${result.isAiGenerated ? 'text-purple-400' : 'text-blue-400'}`}>
                        {result.isAiGenerated ? 'HIGH' : 'LOW'}
                    </span>
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Synthetic Origin</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Reasoning */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-3xl border-white/5">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-3 text-primary-400" />
              Reasoning Engine
            </h3>
            <ul className="space-y-4">
              {result.reasoning.map((reason, idx) => (
                <li key={idx} className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-primary-500/30">
                    {idx + 1}
                  </div>
                  <span className="text-slate-300 leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {result.factChecks.length > 0 && (
            <div className="glass-panel p-8 rounded-3xl border-white/5">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-3 text-green-400" />
                Cross-Verification
              </h3>
              <div className="space-y-4">
                {result.factChecks.map((check, idx) => (
                  <div key={idx} className="border border-white/5 bg-black/30 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Claim</span>
                        <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 border border-white/5">{check.source}</span>
                    </div>
                    <p className="text-slate-200 font-medium mb-3">"{check.claim}"</p>
                    <div className="flex items-center text-sm">
                      <span className="text-slate-500 mr-2">Verdict:</span>
                      <span className={`font-bold ${
                          check.verdict.toLowerCase().includes('true') ? 'text-green-400' : 'text-red-400'
                      }`}>{check.verdict}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Emotional & Actions */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl border-white/5">
            <h3 className="text-xl font-bold text-white mb-6">Emotional Triggers</h3>
            <div className="flex flex-wrap gap-2">
              {result.emotionalTriggers.length > 0 ? (
                result.emotionalTriggers.map((trigger, idx) => (
                  <span key={idx} className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                    {trigger}
                  </span>
                ))
              ) : (
                <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                  Neutral Tone
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                Content designed to trigger these emotions is 4x more likely to be shared without verification.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-primary-500/30 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-[50px] -mr-10 -mt-10"></div>
            <h3 className="text-lg font-bold text-white mb-4 relative z-10">Actionable Intel</h3>
            
            <div className="space-y-3 relative z-10">
              <button className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/5">
                 <ThumbsDown className="w-4 h-4" />
                 <span>Report as Misinformation</span>
              </button>
              <button className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl transition-all font-bold ${
                result.classification === 'Real' 
                ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}>
                 <Share2 className="w-4 h-4" />
                 <span>Verify & Share</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-colors border border-purple-500/20">
                 <Lock className="w-4 h-4" />
                 <span>Generate Blocklist Rule</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
