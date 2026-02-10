import React from 'react';
import { HistoryItem } from '../types';
import { Clock, Search, ExternalLink, Trash2, FileText, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface HistoryProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const History: React.FC<HistoryProps> = ({ history, onSelectHistory, onClearHistory }) => {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-3xl font-bold text-white">Scan History</h2>
           <p className="text-slate-400">Archive of your recent cognitive security scans.</p>
        </div>
        <div className="flex items-center space-x-4">
           <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search logs..." 
                className="pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-primary-500 w-64"
              />
           </div>
           <button 
             onClick={onClearHistory}
             className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
           >
             <Trash2 className="w-5 h-5" />
           </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="glass-panel p-20 rounded-3xl text-center border-white/5">
           <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-slate-600" />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">No Records Found</h3>
           <p className="text-slate-500">Your analysis history will appear here once you start scanning content.</p>
        </div>
      ) : (
        <div className="space-y-4">
           {history.map((item) => (
             <div 
               key={item.id} 
               onClick={() => onSelectHistory(item)}
               className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-primary-500/30 hover:bg-white/5 transition-all cursor-pointer group flex items-center gap-6"
             >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-900 border border-white/10">
                   {item.type === 'image' ? <ImageIcon className="w-5 h-5 text-purple-400" /> : 
                    item.type === 'url' ? <LinkIcon className="w-5 h-5 text-blue-400" /> :
                    <FileText className="w-5 h-5 text-slate-400" />}
                </div>

                <div className="flex-1 min-w-0">
                   <div className="flex items-center space-x-3 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        item.classification === 'Real' ? 'bg-green-500/20 text-green-400' :
                        item.classification === 'Fake' ? 'bg-red-500/20 text-red-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {item.classification.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500">{new Date(item.timestamp || Date.now()).toLocaleString()}</span>
                   </div>
                   <p className="text-slate-200 font-medium truncate">{item.preview}</p>
                </div>

                <div className="flex flex-col items-end text-right">
                   <span className="text-xs text-slate-500 uppercase tracking-wider">Confidence</span>
                   <span className="text-lg font-bold text-white">{item.confidence}%</span>
                </div>
                
                <ExternalLink className="w-5 h-5 text-slate-600 group-hover:text-primary-400 transition-colors" />
             </div>
           ))}
        </div>
      )}
    </div>
  );
};
