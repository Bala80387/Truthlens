import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle, Shield, Inbox, Trash2, ExternalLink, Zap, Lock, Filter, Paperclip, Link as LinkIcon, File, Twitter, Linkedin, Instagram, MessageCircle, Briefcase, Globe, Plus, Settings, LogOut, UserPlus, AlertCircle, Check, Key, X } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { InboxItem, AnalysisResult } from '../types';
import { analyzeContent } from '../services/geminiService';

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API Key not found");
}
const ai = new GoogleGenAI({ apiKey });

// Helper to clean JSON
const cleanJsonString = (str: string): string => {
  return str.replace(/```json\n?|\n?```/g, "").trim();
};

interface ConnectedAccount {
    id: string;
    platform: 'Gmail' | 'Outlook' | 'Twitter' | 'LinkedIn' | 'Instagram' | 'WhatsApp';
    handle: string;
    status: 'Active' | 'Pending' | 'Disconnected';
    lastSync: number;
    scopes?: string[];
}

type AuthStep = 'select-provider' | 'credentials' | 'consent' | 'verifying' | 'success';

export const MailScanner: React.FC = () => {
  const [activeView, setActiveView] = useState<'inbox' | 'accounts'>('inbox');
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([
      { id: '1', platform: 'Gmail', handle: 'demo.user@gmail.com', status: 'Active', lastSync: Date.now(), scopes: ['https://mail.google.com/', 'profile'] }
  ]);
  
  const [items, setItems] = useState<InboxItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Email' | 'Social'>('All');

  // Auth Flow State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>('select-provider');
  const [pendingProvider, setPendingProvider] = useState<ConnectedAccount['platform']>('Gmail');
  const [pendingHandle, setPendingHandle] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
      // Initial fetch if we have accounts
      if (accounts.length > 0 && items.length === 0) {
          fetchInboxData();
      }
  }, []);

  const resetAuthFlow = () => {
      setShowAuthModal(false);
      setAuthStep('select-provider');
      setPendingHandle('');
      setAuthError('');
  };

  const initiateAuth = (platform: ConnectedAccount['platform']) => {
      setPendingProvider(platform);
      setAuthStep('credentials');
  };

  const submitCredentials = () => {
      if (!pendingHandle) {
          setAuthError('Please enter a valid handle or email.');
          return;
      }
      setAuthError('');
      setAuthStep('consent');
  };

  const grantAuthorization = () => {
      setAuthStep('verifying');
      setTimeout(() => {
          const newAccount: ConnectedAccount = {
              id: Date.now().toString(),
              platform: pendingProvider,
              handle: pendingHandle,
              status: 'Active',
              lastSync: Date.now(),
              scopes: ['read_content', 'offline_access']
          };
          setAccounts([...accounts, newAccount]);
          setAuthStep('success');
          setTimeout(() => {
              resetAuthFlow();
              setActiveView('accounts');
          }, 1500);
      }, 2000);
  };

  const handleDisconnect = (id: string) => {
      setAccounts(accounts.filter(a => a.id !== id));
  };

  const fetchInboxData = async () => {
      setIsRefreshing(true);
      try {
          const connectedContext = accounts.map(a => `${a.platform} account (${a.handle})`).join(', ');
          
          const prompt = `
            Generate a JSON array of 6 realistic unified inbox items based on these connected accounts: ${connectedContext || "Generic User"}.
            
            SCENARIOS (Mix these):
            1. Phishing attempt pretending to be a service relevant to the platform (e.g., "Verify your Twitter").
            2. Legitimate notification or newsletter.
            3. Social Engineering attempt (e.g., "Urgent project" if Outlook/Gmail, "Collab offer" if Instagram).
            4. Crypto scam if Twitter/Telegram.
            5. Headhunter spam if LinkedIn.

            Schema per object:
            {
                "id": "unique_string",
                "platform": "Gmail" | "Outlook" | "Twitter" | "LinkedIn" | "Instagram" | "WhatsApp",
                "sender": "Display Name",
                "senderHandle": "@handle or email",
                "subject": "Subject Line" (only for emails, null for DMs),
                "snippet": "Short preview...",
                "body": "Full message text. Include scam links or persuasive language.",
                "timestamp": number (recent date),
                "isRead": boolean,
                "tags": ["Inbox", "Spam", "DM"],
                "riskLevel": "Safe" | "Suspicious" | "Malicious",
                "attachments": [{"name": "file.pdf", "type": "application/pdf", "size": "1.2MB"}] (optional)
            }
          `;

          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: prompt,
              config: { responseMimeType: "application/json" }
          });

          const jsonStr = cleanJsonString(response.text || "[]");
          const fetchedItems = JSON.parse(jsonStr);
          
          setItems(fetchedItems);
      } catch (e) {
          console.error("Failed to fetch inbox data", e);
      } finally {
          setIsRefreshing(false);
      }
  };

  const handleSelectItem = async (item: InboxItem) => {
      setSelectedItem(item);
      setAnalysis(null);
      setIsAnalyzing(true);
      setScanStatus('Initializing scan...');
      
      try {
          // Extract links from body (simple regex)
          const linkRegex = /(https?:\/\/[^\s]+)/g;
          const links = item.body.match(linkRegex) || [];
          
          // --- STEP 1: Body Scan ---
          setScanStatus('Analyzing semantic patterns for social engineering...');
          await new Promise(r => setTimeout(r, 800)); // UX Delay

          // --- STEP 2: Link Scan ---
          if (links.length > 0) {
              setScanStatus(`Inspecting ${links.length} external links for phishing signatures...`);
              await new Promise(r => setTimeout(r, 800));
          }

          // --- STEP 3: Attachment Scan ---
          if (item.attachments && item.attachments.length > 0) {
              setScanStatus(`Scanning ${item.attachments.length} attachments for malware heuristics...`);
              await new Promise(r => setTimeout(r, 1000));
          }

          // --- STEP 4: Deep Analysis ---
          setScanStatus('Aggregating threat intelligence...');

          let scanContext = `Platform: ${item.platform}\nSender: ${item.sender} (${item.senderHandle})\n${item.subject ? `Subject: ${item.subject}\n` : ''}Message: ${item.body}`;
          
          if (item.attachments && item.attachments.length > 0) {
              scanContext += `\n\n[ATTACHMENTS METADATA]\n${JSON.stringify(item.attachments)}`;
          }
          
          if (links.length > 0) {
              scanContext += `\n\n[LINKS EXTRACTED]\n${links.join('\n')}`;
          }
          
          scanContext += `\n\nSECURITY TASK:
          1. Analyze the message body for NLP indicators of deception, urgency, fear, or greed.
          2. Analyze the Links: Check if the domains are consistent with the sender. Look for typosquatting, suspicious TLDs, or redirection risks.
          3. Analyze the Attachments: Check if the file types (e.g. .exe, .scr, .zip) are suspicious in this context or if the filenames suggest malware.
          4. Determine the Overall Risk Level (Safe, Suspicious, Malicious) and provide a confidence score.
          5. Return a standard JSON analysis result with specific reasoning for any flagged links or attachments.`;

          const result = await analyzeContent(
              scanContext,
              'text',
              undefined,
              item.platform === 'Gmail' || item.platform === 'Outlook' ? 'Email' : 'Social DM'
          );
          setAnalysis(result);
      } catch (e) {
          console.error(e);
      } finally {
          setIsAnalyzing(false);
          setScanStatus('');
      }
  };

  const getRiskColor = (level: string) => {
      switch(level) {
          case 'Malicious': return 'text-red-500 border-red-500/50 bg-red-500/10';
          case 'Suspicious': return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
          default: return 'text-green-500 border-green-500/50 bg-green-500/10';
      }
  };

  const getPlatformIcon = (platform: string) => {
      switch(platform) {
          case 'Twitter': return <Twitter className="w-4 h-4 text-blue-400" />;
          case 'LinkedIn': return <Linkedin className="w-4 h-4 text-blue-600" />;
          case 'Instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
          case 'WhatsApp': return <MessageCircle className="w-4 h-4 text-green-500" />;
          case 'Gmail': return <Mail className="w-4 h-4 text-red-400" />;
          case 'Outlook': return <Mail className="w-4 h-4 text-blue-500" />;
          default: return <Inbox className="w-4 h-4 text-slate-400" />;
      }
  };

  // Helper to extract links for display
  const getExtractedLinks = (text: string) => {
      const linkRegex = /(https?:\/\/[^\s]+)/g;
      return text.match(linkRegex) || [];
  };

  const filteredItems = items.filter(item => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Email') return item.platform === 'Gmail' || item.platform === 'Outlook';
      if (activeFilter === 'Social') return ['Twitter', 'LinkedIn', 'Instagram', 'WhatsApp'].includes(item.platform);
      return true;
  });

  return (
    <div className="h-[calc(100vh-140px)] animate-fade-in flex flex-col lg:flex-row gap-6 pb-6 relative">
       
       {/* Auth Modal */}
       {showAuthModal && (
           <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
               <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
                   {/* Modal Header */}
                   <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                       <h3 className="text-lg font-bold text-white flex items-center">
                           <Shield className="w-5 h-5 mr-2 text-primary-400" />
                           {authStep === 'success' ? 'Authorized' : 'Connect Account'}
                       </h3>
                       <button onClick={resetAuthFlow} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                   </div>

                   {/* Content */}
                   <div className="p-8">
                       
                       {authStep === 'select-provider' && (
                           <div className="space-y-4">
                               <p className="text-slate-400 text-sm mb-4">Select a provider to authorize TruthLens scan access.</p>
                               {[
                                   { id: 'Gmail', icon: <Mail className="w-5 h-5" />, color: 'hover:bg-red-500/10 hover:border-red-500/50' },
                                   { id: 'Outlook', icon: <Mail className="w-5 h-5" />, color: 'hover:bg-blue-500/10 hover:border-blue-500/50' },
                                   { id: 'Twitter', icon: <Twitter className="w-5 h-5" />, color: 'hover:bg-blue-400/10 hover:border-blue-400/50' },
                                   { id: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, color: 'hover:bg-blue-600/10 hover:border-blue-600/50' },
                               ].map((p) => (
                                   <button 
                                     key={p.id}
                                     onClick={() => initiateAuth(p.id as any)}
                                     className={`w-full flex items-center space-x-4 p-4 rounded-xl border border-white/10 bg-white/5 transition-all group ${p.color}`}
                                   >
                                       <div className="text-slate-300 group-hover:text-white transition-colors">{p.icon}</div>
                                       <span className="font-bold text-slate-300 group-hover:text-white">Connect {p.id}</span>
                                       <ExternalLink className="w-4 h-4 ml-auto text-slate-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                                   </button>
                               ))}
                           </div>
                       )}

                       {authStep === 'credentials' && (
                           <div className="space-y-4">
                               <div className="flex items-center space-x-2 text-primary-400 mb-2">
                                   {getPlatformIcon(pendingProvider)}
                                   <span className="font-bold">{pendingProvider} Login</span>
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Username / Email</label>
                                   <input 
                                     type="text" 
                                     value={pendingHandle}
                                     onChange={(e) => setPendingHandle(e.target.value)}
                                     placeholder={pendingProvider.includes('mail') ? "user@example.com" : "@username"}
                                     className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary-500"
                                   />
                               </div>
                               {authError && <p className="text-red-400 text-xs">{authError}</p>}
                               <button 
                                 onClick={submitCredentials}
                                 className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all mt-2"
                               >
                                   Next
                               </button>
                           </div>
                       )}

                       {authStep === 'consent' && (
                           <div className="space-y-6">
                               <div className="text-center mb-6">
                                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                       <Key className="w-8 h-8 text-yellow-500" />
                                   </div>
                                   <h4 className="text-lg font-bold text-white mb-1">Authorization Request</h4>
                                   <p className="text-slate-400 text-xs">TruthLens requests the following permissions for <span className="text-white">{pendingHandle}</span>:</p>
                               </div>

                               <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                   {['View email metadata (headers)', 'Read inbox content', 'Analyze attachments for malware', 'Read profile information'].map((scope, i) => (
                                       <div key={i} className="flex items-start space-x-3">
                                           <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                           <span className="text-sm text-slate-300">{scope}</span>
                                       </div>
                                   ))}
                               </div>

                               <div className="flex space-x-3">
                                   <button 
                                     onClick={resetAuthFlow}
                                     className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-all"
                                   >
                                       Cancel
                                   </button>
                                   <button 
                                     onClick={grantAuthorization}
                                     className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all"
                                   >
                                       Authorize
                                   </button>
                               </div>
                               <p className="text-[10px] text-slate-500 text-center">
                                   OAuth2.0 Standard. Token expires in 1 hour.
                               </p>
                           </div>
                       )}

                       {authStep === 'verifying' && (
                           <div className="flex flex-col items-center justify-center py-8">
                               <RefreshCw className="w-12 h-12 text-primary-400 animate-spin mb-4" />
                               <h4 className="text-white font-bold">Verifying Token...</h4>
                               <p className="text-slate-500 text-xs mt-2">Exchanging authorization code for access token.</p>
                           </div>
                       )}

                       {authStep === 'success' && (
                           <div className="flex flex-col items-center justify-center py-8">
                               <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/50">
                                   <CheckCircle className="w-8 h-8 text-green-500" />
                               </div>
                               <h4 className="text-white font-bold">Connection Established</h4>
                               <p className="text-slate-500 text-xs mt-2">Secure channel active. Redirecting...</p>
                           </div>
                       )}

                   </div>
               </div>
           </div>
       )}

       {/* Accounts Management View */}
       {activeView === 'accounts' ? (
          <div className="w-full flex flex-col items-center justify-center p-6">
              <div className="max-w-3xl w-full glass-panel rounded-3xl border-white/10 overflow-hidden relative">
                  <div className="p-8">
                      <div className="flex justify-between items-center mb-8">
                          <div>
                              <h2 className="text-2xl font-bold text-white mb-1">Connected Accounts</h2>
                              <p className="text-slate-400 text-sm">Manage authenticated data sources for the Unified Threat Guard.</p>
                          </div>
                          <button onClick={() => setActiveView('inbox')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold text-slate-300 transition-colors">
                              Back to Inbox
                          </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                          {accounts.map(acc => (
                              <div key={acc.id} className="p-5 bg-black/40 rounded-2xl border border-white/5 relative group hover:border-primary-500/30 transition-all">
                                  <div className="flex justify-between items-start mb-4">
                                      <div className="flex items-center space-x-3">
                                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                              {getPlatformIcon(acc.platform)}
                                          </div>
                                          <div>
                                              <div className="font-bold text-white text-sm">{acc.platform}</div>
                                              <div className="text-xs text-slate-400">{acc.handle}</div>
                                          </div>
                                      </div>
                                      <div className="bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 text-[10px] font-bold text-green-400 uppercase">
                                          Active
                                      </div>
                                  </div>
                                  
                                  <div className="space-y-2 mb-4">
                                      <div className="flex justify-between text-[10px] text-slate-500">
                                          <span>Last Sync</span>
                                          <span className="text-slate-300">{new Date(acc.lastSync).toLocaleTimeString()}</span>
                                      </div>
                                      <div className="flex justify-between text-[10px] text-slate-500">
                                          <span>Permissions</span>
                                          <span className="text-slate-300">{acc.scopes?.length || 2} Scopes Granted</span>
                                      </div>
                                  </div>

                                  <div className="flex space-x-2 pt-4 border-t border-white/5">
                                      <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 transition-colors">
                                          Re-Sync
                                      </button>
                                      <button 
                                        onClick={() => handleDisconnect(acc.id)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                              </div>
                          ))}
                          
                          {/* Add New Card */}
                          <button 
                            onClick={() => setShowAuthModal(true)}
                            className="p-5 bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center hover:bg-white/10 hover:border-primary-500/50 transition-all group"
                          >
                              <div className="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                  <Plus className="w-6 h-6 text-primary-400" />
                              </div>
                              <span className="font-bold text-white text-sm">Connect New Account</span>
                              <span className="text-xs text-slate-500 mt-1">Gmail, Outlook, X, etc.</span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
       ) : (
       
       /* Main Inbox View */
       <>
       {/* Sidebar / List */}
       <div className="w-full lg:w-96 glass-panel rounded-3xl border-white/5 bg-black/40 flex flex-col overflow-hidden">
           {/* Header */}
           <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center">
                       <Inbox className="w-4 h-4 mr-2 text-primary-400" /> Universal Inbox
                   </h3>
                   <div className="flex space-x-2">
                       <button 
                         onClick={() => setActiveView('accounts')}
                         className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                         title="Manage Accounts"
                       >
                           <Settings className="w-4 h-4" />
                       </button>
                       <button onClick={fetchInboxData} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                           <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                       </button>
                   </div>
               </div>
               
               {/* Filters */}
               <div className="flex space-x-1 bg-black/40 p-1 rounded-lg">
                   {['All', 'Email', 'Social'].map(f => (
                       <button
                           key={f}
                           onClick={() => setActiveFilter(f as any)}
                           className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${
                               activeFilter === f 
                               ? 'bg-white/10 text-white shadow-sm' 
                               : 'text-slate-500 hover:text-slate-300'
                           }`}
                       >
                           {f}
                       </button>
                   ))}
               </div>
           </div>

           {/* List */}
           <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
               {filteredItems.map(item => (
                   <div 
                     key={item.id}
                     onClick={() => handleSelectItem(item)}
                     className={`p-3 rounded-xl cursor-pointer transition-all border group ${
                         selectedItem?.id === item.id 
                         ? 'bg-white/10 border-primary-500/50' 
                         : 'bg-transparent border-transparent hover:bg-white/5'
                     }`}
                   >
                       <div className="flex justify-between items-center mb-1">
                           <div className="flex items-center space-x-2">
                               {getPlatformIcon(item.platform)}
                               <span className={`text-xs font-bold ${selectedItem?.id === item.id ? 'text-white' : 'text-slate-300'}`}>{item.sender}</span>
                           </div>
                           <span className="text-[9px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                       </div>
                       
                       <div className="text-sm font-medium text-slate-200 truncate mb-1">
                           {item.subject ? item.subject : <span className="italic text-slate-500">Direct Message</span>}
                       </div>
                       <div className="text-xs text-slate-500 truncate">{item.snippet}</div>
                       
                       <div className="flex items-center mt-2 space-x-2">
                           <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold ${getRiskColor(item.riskLevel)}`}>
                               {item.riskLevel}
                           </span>
                           {item.attachments && item.attachments.length > 0 && (
                               <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5 flex items-center">
                                   <Paperclip className="w-2 h-2 mr-1" /> {item.attachments.length}
                               </span>
                           )}
                           <span className="text-[9px] text-slate-600 px-1">{item.platform}</span>
                       </div>
                   </div>
               ))}
               {filteredItems.length === 0 && !isRefreshing && (
                   <div className="p-8 text-center text-slate-500">
                       <Inbox className="w-10 h-10 mx-auto mb-2 opacity-20" />
                       <p className="text-xs">No items found. Check filters or refresh.</p>
                   </div>
               )}
           </div>
       </div>

       {/* Reading Pane */}
       <div className="flex-1 glass-panel rounded-3xl border-white/5 bg-black/40 flex flex-col relative overflow-hidden">
           {!selectedItem ? (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                   <Shield className="w-16 h-16 mb-4 opacity-20" />
                   <p className="mb-4">Select a message to scan.</p>
                   {accounts.length === 0 && (
                       <button onClick={() => setShowAuthModal(true)} className="text-primary-400 hover:text-primary-300 text-xs font-bold uppercase underline">
                           Connect Accounts
                       </button>
                   )}
               </div>
           ) : (
               <div className="flex-1 flex flex-col h-full">
                   {/* Message Header */}
                   <div className="p-6 border-b border-white/10">
                       <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center space-x-3">
                               <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                   {getPlatformIcon(selectedItem.platform)}
                               </div>
                               <div>
                                   <div className="text-lg font-bold text-white">{selectedItem.sender}</div>
                                   <div className="text-xs text-slate-400">{selectedItem.senderHandle}</div>
                               </div>
                           </div>
                           <div className="flex space-x-2">
                               <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                               <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><ExternalLink className="w-4 h-4" /></button>
                           </div>
                       </div>
                       
                       {selectedItem.subject && (
                           <div className="text-sm font-medium text-slate-200 bg-black/20 p-2 rounded mb-2 border border-white/5">
                               Subject: {selectedItem.subject}
                           </div>
                       )}
                   </div>

                   {/* Message Body & Attachments */}
                   <div className="flex-1 p-6 overflow-y-auto bg-white/5">
                       <div className={`text-slate-200 text-sm whitespace-pre-wrap leading-relaxed font-sans mb-6 ${!selectedItem.subject ? 'bg-black/20 p-4 rounded-xl border border-white/5' : ''}`}>
                           {selectedItem.body}
                       </div>

                       {/* Scanned Artifacts Section */}
                       <div className="space-y-4">
                           {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                               <div className="space-y-2">
                                   <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center">
                                       <Paperclip className="w-3 h-3 mr-2" /> Attachments
                                   </h4>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                       {selectedItem.attachments.map((file, i) => (
                                           <div key={i} className="flex items-center p-3 bg-black/40 border border-white/5 rounded-lg group hover:border-primary-500/30 transition-colors">
                                               <div className="p-2 bg-white/10 rounded-lg mr-3">
                                                   <File className="w-4 h-4 text-slate-300" />
                                               </div>
                                               <div className="flex-1 min-w-0">
                                                   <div className="text-sm text-white font-medium truncate">{file.name}</div>
                                                   <div className="text-xs text-slate-500">{file.size} • {file.type}</div>
                                               </div>
                                               <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400 border border-white/5">Scanned</span>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                           )}

                           {getExtractedLinks(selectedItem.body).length > 0 && (
                               <div className="space-y-2">
                                   <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center">
                                       <LinkIcon className="w-3 h-3 mr-2" /> Extracted Links
                                   </h4>
                                   <div className="space-y-1">
                                       {getExtractedLinks(selectedItem.body).map((link, i) => (
                                           <div key={i} className="flex items-center justify-between p-2 bg-black/40 border border-white/5 rounded-lg text-xs">
                                               <span className="text-primary-400 truncate max-w-[80%]">{link}</span>
                                               <ExternalLink className="w-3 h-3 text-slate-600" />
                                           </div>
                                       ))}
                                   </div>
                               </div>
                           )}
                       </div>
                   </div>

                   {/* Analysis Footer Panel */}
                   <div className="border-t-2 border-primary-500/30 bg-black/60 backdrop-blur-xl p-6 relative">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-primary-500 to-transparent"></div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Zap className="w-5 h-5 text-primary-400" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Unified Threat Analysis</h3>
                        </div>

                        {isAnalyzing ? (
                            <div className="flex items-center space-x-3 text-slate-400 py-4">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="text-xs font-mono uppercase">{scanStatus || 'Initializing...'}</span>
                            </div>
                        ) : analysis ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-slate-500 uppercase font-bold">Verdict</span>
                                        <span className={`text-sm font-black uppercase ${analysis.classification === 'Real' ? 'text-green-400' : 'text-red-500'}`}>
                                            {analysis.classification === 'Real' ? 'Legitimate' : analysis.classification}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                                        {analysis.summary}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/5">
                                        <span className="text-xs text-slate-400">Scam Probability</span>
                                        <span className={`text-xs font-bold ${analysis.confidence > 80 ? 'text-red-400' : 'text-green-400'}`}>{analysis.confidence}%</span>
                                    </div>
                                    <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/5">
                                        <span className="text-xs text-slate-400">Urgency Detection</span>
                                        <span className="text-xs font-bold text-orange-400">{analysis.emotionalTriggers.includes('Urgency') ? 'High' : 'Normal'}</span>
                                    </div>
                                    {analysis.classification !== 'Real' && (
                                        <button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded transition-colors uppercase tracking-wider">
                                            Block Sender & Report
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : null}
                   </div>
               </div>
           )}
       </div>
       </>
       )}
    </div>
  );
};