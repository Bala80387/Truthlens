import React, { useState, useEffect } from 'react';
import { UserSettings } from '../types';
import { Bell, Shield, Globe, Monitor, Moon, Save, User, CheckCircle, LogOut } from 'lucide-react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    sensitivity: 'medium',
    autoDetectLanguage: true,
    notifications: true,
    theme: 'dark'
  });

  const [user, setUser] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Listen for OAuth success message
    const handleMessage = (event: MessageEvent) => {
      // Validate origin if possible, but for preview/dev allow localhost and run.app
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setUser(event.data.user);
        setIsConnecting(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleGoogleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/auth/google/url');
      const { url } = await response.json();
      
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      window.open(
        url,
        'google_oauth',
        `width=${width},height=${height},top=${top},left=${left}`
      );
    } catch (error) {
      console.error('Failed to start OAuth flow', error);
      setIsConnecting(false);
    }
  };

  const toggle = (key: keyof UserSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] as any }));
  };

  const setSensitivity = (val: 'low' | 'medium' | 'high') => {
    setSettings(prev => ({ ...prev, sensitivity: val }));
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
       <h2 className="text-3xl font-bold text-white mb-2">Configuration</h2>
       <p className="text-slate-400 mb-8">Customize the behavior of the TruthLens engine.</p>

       <div className="space-y-6">
          {/* Account Section */}
          <div className="glass-panel p-6 rounded-2xl border-white/5">
             <div className="flex items-center space-x-3 mb-6">
                <User className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Account Integration</h3>
             </div>
             
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-slate-200 font-medium">Google Account</p>
                   <p className="text-xs text-slate-500">Connect to sync analysis history and preferences.</p>
                </div>
                
                {user ? (
                  <div className="flex items-center space-x-4 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                    {user.picture && (
                      <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full" />
                    )}
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">{user.name}</p>
                      <p className="text-xs text-green-600/80">Connected</p>
                    </div>
                    <button 
                      onClick={() => setUser(null)}
                      className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleGoogleConnect}
                    disabled={isConnecting}
                    className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <span className="animate-pulse">Connecting...</span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span>Connect Google</span>
                      </>
                    )}
                  </button>
                )}
             </div>
          </div>

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
