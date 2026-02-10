import React from 'react';
import { View } from '../types';
import { ShieldAlert, GraduationCap, Settings, Menu, X, Activity, Clock, Share2 } from 'lucide-react';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  
  const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Trend Watch', icon: <Activity className="w-5 h-5" /> },
    { id: 'analyzer', label: 'Detection Engine', icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'shield', label: 'Social Shield', icon: <Share2 className="w-5 h-5" /> },
    { id: 'history', label: 'Scan History', icon: <Clock className="w-5 h-5" /> },
    { id: 'education', label: 'Academy', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleNavClick = (id: View) => {
    setView(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 glass-panel border-b border-white/10 flex items-center justify-between px-4 bg-black/80 backdrop-blur-xl">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.5)]">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">TruthLens</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300 hover:text-white transition-colors">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`
        fixed inset-y-0 left-0 z-40 w-72 glass-panel border-r border-white/5 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:block
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        pt-24 md:pt-8 flex flex-col justify-between bg-black/50
      `}>
        <div>
          <div 
            className="hidden md:flex items-center space-x-3 px-8 mb-10 cursor-pointer group" 
            onClick={() => setView('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.3)] group-hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-all">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
               <span className="font-bold text-xl tracking-tight text-white block leading-none">TruthLens</span>
               <span className="text-[10px] text-primary-400 uppercase tracking-widest">AI Security</span>
            </div>
          </div>

          <div className="px-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-300 group
                  ${currentView === item.id 
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}
                `}
              >
                <div className={`transition-colors ${currentView === item.id ? 'text-primary-400' : 'group-hover:text-white'}`}>
                  {item.icon}
                </div>
                <span className="font-medium tracking-wide">{item.label}</span>
                {currentView === item.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_10px_rgba(56,189,248,1)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="p-5 rounded-2xl bg-gradient-to-b from-surfaceHighlight to-black border border-white/5 shadow-inner">
            <div className="flex items-center justify-between mb-3">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Status</h4>
               <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">v2.1.0</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Engine</span>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Model</span>
                <span className="text-xs text-primary-400">Gemini 2.5</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};