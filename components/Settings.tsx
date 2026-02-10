import React, { useState } from 'react';
import { UserSettings } from '../types';
import { Bell, Shield, Globe, Monitor, Moon, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    sensitivity: 'medium',
    autoDetectLanguage: true,
    notifications: true,
    theme: 'dark'
  });

  const toggle = (key: keyof UserSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setSensitivity = (val: 'low' | 'medium' | 'high') => {
    setSettings(prev => ({ ...prev, sensitivity: val }));
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
       <h2 className="text-3xl font-bold text-white mb-2">Configuration</h2>
       <p className="text-slate-400 mb-8">Customize the behavior of the TruthLens engine.</p>

       <div className="space-y-6">
          {/* Section 1 */}
          <div className="glass-panel p-6 rounded-2xl border-white/5">
             <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-5 h-5 text-primary-400" />
                <h3 className="text-lg font-bold text-white">Detection Parameters</h3>
             </div>
             
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div>
                      <p className="text-slate-200 font-medium">Analysis Sensitivity</p>
                      <p className="text-xs text-slate-500">Threshold for flagging content as misleading.</p>
                   </div>
                   <div className="flex bg-black/50 rounded-lg p-1 border border-white/10">
                      {(['low', 'medium', 'high'] as const).map((level) => (
                         <button
                           key={level}
                           onClick={() => setSensitivity(level)}
                           className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                             settings.sensitivity === level 
                             ? 'bg-primary-600 text-white shadow-lg' 
                             : 'text-slate-500 hover:text-slate-300'
                           }`}
                         >
                           {level}
                         </button>
                      ))}
                   </div>
                </div>

                <div className="h-px bg-white/5"></div>

                <div className="flex items-center justify-between">
                   <div>
                      <p className="text-slate-200 font-medium">Auto-Language Detection</p>
                      <p className="text-xs text-slate-500">Automatically translate non-English content before analysis.</p>
                   </div>
                   <button 
                     onClick={() => toggle('autoDetectLanguage')}
                     className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.autoDetectLanguage ? 'bg-primary-600' : 'bg-slate-700'}`}
                   >
                     <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.autoDetectLanguage ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </button>
                </div>
             </div>
          </div>

          {/* Section 2 */}
          <div className="glass-panel p-6 rounded-2xl border-white/5">
             <div className="flex items-center space-x-3 mb-6">
                <Monitor className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">System Preferences</h3>
             </div>
             
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div>
                      <p className="text-slate-200 font-medium">Real-time Alerts</p>
                      <p className="text-xs text-slate-500">Push notifications for high-severity viral threats.</p>
                   </div>
                   <button 
                     onClick={() => toggle('notifications')}
                     className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.notifications ? 'bg-green-500' : 'bg-slate-700'}`}
                   >
                     <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </button>
                </div>
             </div>
          </div>

          <div className="flex justify-end pt-4">
             <button className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
             </button>
          </div>
       </div>
    </div>
  );
};
