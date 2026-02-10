import React, { useState } from 'react';
import { View, AnalysisResult, HistoryItem } from './types';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Analyzer } from './components/Analyzer';
import { Education } from './components/Education';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { SocialShield } from './components/SocialShield';
import { ViralTracker } from './components/ViralTracker';
import { GeoAnalysis } from './components/GeoAnalysis';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('analyzer');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [quickScanText, setQuickScanText] = useState<string>('');

  const handleAnalysisComplete = (result: AnalysisResult, content: string, type: 'text' | 'image' | 'url' | 'video' | 'audio') => {
    const newItem: HistoryItem = {
      ...result,
      id: Math.random().toString(36).substr(2, 9),
      preview: type === 'image' ? 'Image Analysis' : content.length > 60 ? content.substring(0, 60) + '...' : content,
      type,
      timestamp: Date.now()
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const handleQuickScan = (text: string) => {
    setQuickScanText(text);
    setCurrentView('analyzer');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onAnalyzeTopic={handleQuickScan} />;
      case 'tracker':
        return <ViralTracker />;
      case 'geo':
        return <GeoAnalysis />;
      case 'analyzer':
        return <Analyzer 
          initialText={quickScanText} 
          onAnalysisComplete={handleAnalysisComplete} 
        />;
      case 'shield':
        return <SocialShield />;
      case 'history':
        return <History 
          history={history} 
          onSelectHistory={(item) => {
             // For now, simple view, ideally would restore ResultView state
             alert(`Viewing logs for ID: ${item.id}. Detailed history replay coming in v2.2`);
          }} 
          onClearHistory={() => setHistory([])}
        />;
      case 'education':
        return <Education />;
      case 'settings':
        return <Settings />;
      default:
        return <Analyzer onAnalysisComplete={handleAnalysisComplete} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-50 flex font-sans selection:bg-primary-500/30 selection:text-primary-200">
      <Navigation 
        currentView={currentView} 
        setView={(view) => {
          setCurrentView(view);
          if (view !== 'analyzer') setQuickScanText(''); // Reset quick scan when navigating away
        }} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto h-screen relative scroll-smooth">
        {/* Ambient Atmosphere */}
        <div className="fixed inset-0 pointer-events-none z-0">
           <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-primary-900/10 rounded-full blur-[120px] opacity-40"></div>
           <div className="absolute bottom-[-20%] left-[-20%] w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] opacity-40"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24 md:py-12 md:px-8 max-w-7xl">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;