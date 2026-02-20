import React, { useState, useRef, useEffect } from 'react';
import { Upload, Type, Link as LinkIcon, Image as ImageIcon, Sparkles, AlertCircle, Globe, Search, Video, Mic, MicOff, Radio, Bot, Terminal, ShieldCheck, Zap, RefreshCw, BarChart3, Cpu, FileText, Facebook, Twitter, Instagram, MessageCircle, Library, Pill, TrendingUp, Vote } from 'lucide-react';
import { analyzeContent, runAutonomousInvestigation } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { ResultsView } from './ResultsView';

interface AnalyzerProps {
  initialText?: string;
  onAnalysisComplete: (result: AnalysisResult, content: string, type: 'text' | 'image' | 'url' | 'video' | 'audio') => void;
}

export const Analyzer: React.FC<AnalyzerProps> = ({ initialText, onAnalysisComplete }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'url' | 'video' | 'audio'>('text');
  const [inputText, setInputText] = useState(initialText || '');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'Generic' | 'Facebook' | 'Twitter' | 'Instagram' | 'WhatsApp'>('Generic');
  const [domain, setDomain] = useState<'General' | 'Politics' | 'Health' | 'Finance'>('General');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDeepAgentMode, setIsDeepAgentMode] = useState(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Real-time Heuristics
  const [metrics, setMetrics] = useState({ complexity: 0, urgency: 0, noise: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Update input text if prop changes
  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      setActiveTab('text');
    }
  }, [initialText]);

  // Heuristic Analysis Effect
  useEffect(() => {
    if (!inputText) {
        setMetrics({ complexity: 0, urgency: 0, noise: 0 });
        return;
    }
    const words = inputText.trim().split(/\s+/);
    if (words.length === 0) return;

    const avgLen = words.reduce((acc, w) => acc + w.length, 0) / words.length;
    const caps = words.filter(w => w.length > 1 && w === w.toUpperCase()).length;
    const special = (inputText.match(/[^a-zA-Z0-9\s]/g) || []).length;
    
    setMetrics({
        complexity: Math.min(100, Math.max(10, avgLen * 12)), // Higher avg length = higher complexity
        urgency: Math.min(100, (caps * 5) + (inputText.match(/!/g) || []).length * 10), // Caps and ! increase urgency
        noise: Math.min(100, (special * 2) + (words.length < 5 ? 50 : 0)) // Special chars or very short text
    });
  }, [inputText]);

  // Simulated agent log stream
  const addLog = (log: string) => {
    setAgentLogs(prev => [...prev, log]);
  };

  const loadExample = (type: string) => {
      if (type === 'fake') setInputText("BREAKING: Secret documents leaked from Sector 7 reveal government weather control machine caused recent storms! #WakeUp #Truth");
      if (type === 'scam') setInputText("URGENT: Your account has been compromised. Click here immediately to verify your identity or lose access forever. http://bit.ly/secure-login-v2");
      if (type === 'satire') setInputText("Local cat elected mayor, promises to outlaw vacuum cleaners and increase nap subsidies.");
  };

  const handleAnalyze = async () => {
    const hasContent = 
      (activeTab === 'text' && inputText.trim()) || 
      (activeTab === 'url' && inputText.trim()) || 
      (activeTab === 'image' && selectedImage) ||
      (activeTab === 'video' && selectedVideo) ||
      (activeTab === 'audio' && audioBase64);

    if (!hasContent) return;

    setIsAnalyzing(true);
    setAgentLogs([]);
    
    if (isDeepAgentMode) {
        addLog("> Initializing Autonomous Investigative Agent...");
        await new Promise(r => setTimeout(r, 600));
        addLog(`> Analyzing content context: ${platform}...`);
        addLog(`> Loading domain weights: ${domain}...`);
        await new Promise(r => setTimeout(r, 600));
        addLog("> Parsing claim semantics and entity extraction...");
        await new Promise(r => setTimeout(r, 600));
        addLog("> Connecting to Global Knowledge Graph (Google Search)...");
    }

    try {
      let dataToAnalyze = undefined;
      
      if (activeTab === 'image' && selectedImage) dataToAnalyze = selectedImage.split(',')[1];
      if (activeTab === 'audio' && audioBase64) dataToAnalyze = audioBase64;

      // For video, extract a frame
      if (activeTab === 'video' && videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        const frameData = canvas.toDataURL('image/jpeg');
        dataToAnalyze = frameData.split(',')[1];
      }

      // 1. Standard Analysis with Domain Specialization
      const analysis = await analyzeContent(
        inputText, 
        activeTab,
        dataToAnalyze,
        platform,
        domain
      );

      // 2. Deep Investigation (If enabled and text/url based)
      if (isDeepAgentMode && (activeTab === 'text' || activeTab === 'url')) {
          addLog("> Executing search queries across trusted domains...");
          
          // Determine the claim to investigate
          const claimToInvestigate = activeTab === 'url' ? inputText : inputText.substring(0, 300);
          
          const investigation = await runAutonomousInvestigation(claimToInvestigate);
          
          addLog(`> Found ${investigation.sources.length} corroborating sources.`);
          addLog("> Synthesizing Truth Dossier...");
          addLog("> Finalizing verdict...");
          
          analysis.investigation = investigation;
      }
      
      setResult(analysis);
      
      // Determine content preview string
      let contentPreview = inputText;
      if (activeTab === 'image') contentPreview = 'Image Analysis';
      if (activeTab === 'video') contentPreview = 'Video Keyframe Analysis';
      if (activeTab === 'audio') contentPreview = 'Voice Analysis';

      onAnalysisComplete(analysis, contentPreview, activeTab);

    } catch (e) {
      console.error(e);
      alert("Analysis failed. Please check your connection or API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' }); // Using generic type, Gemini handles format detection
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setAudioBase64(base64String.split(',')[1]); // Remove data:audio/xxx;base64, prefix
            };
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setAudioBase64(null);
    } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setSelectedVideo(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedVideo(url);
      setSelectedImage(null);
    }
  };

  if (result) {
    return <ResultsView 
      result={result} 
      onReset={() => {
        setResult(null);
        setInputText('');
        setSelectedImage(null);
        setSelectedVideo(null);
        setAudioBase64(null);
        setAgentLogs([]);
      }}
      contentType={activeTab}
      contentSource={activeTab === 'image' ? selectedImage : activeTab === 'video' ? selectedVideo : null}
    />;
  }

  const platforms = [
      { id: 'Generic', icon: <Globe className="w-4 h-4" />, label: 'Web/Generic', color: 'text-slate-400' },
      { id: 'Facebook', icon: <Facebook className="w-4 h-4" />, label: 'Facebook', color: 'text-blue-500' },
      { id: 'Twitter', icon: <Twitter className="w-4 h-4" />, label: 'Twitter / X', color: 'text-white' },
      { id: 'Instagram', icon: <Instagram className="w-4 h-4" />, label: 'Instagram', color: 'text-pink-500' },
      { id: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" />, label: 'WhatsApp', color: 'text-green-500' },
  ];

  const domains = [
      { id: 'General', label: 'General', icon: <Library className="w-4 h-4" />, color: 'text-slate-400' },
      { id: 'Politics', label: 'Politics', icon: <Vote className="w-4 h-4" />, color: 'text-red-400' },
      { id: 'Health', label: 'Health', icon: <Pill className="w-4 h-4" />, color: 'text-green-400' },
      { id: 'Finance', label: 'Finance', icon: <TrendingUp className="w-4 h-4" />, color: 'text-yellow-400' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
          Verify. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-500 neon-text">Understand.</span> Trust.
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto">
          Advanced cognitive security engine using BERT, LSTM, and Multimodal Transformers for deepfake detection.
        </p>
      </div>

      {/* Main Container */}
      <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

        {/* Top Controls Bar (Context Selector) */}
        <div className="bg-black/40 border-b border-white/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Input Type Selector */}
            <div className="flex bg-black/60 rounded-xl p-1 border border-white/5 overflow-x-auto max-w-full no-scrollbar">
                {[
                    { id: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
                    { id: 'url', label: 'URL', icon: <Globe className="w-4 h-4" /> },
                    { id: 'image', label: 'Image', icon: <ImageIcon className="w-4 h-4" /> },
                    { id: 'video', label: 'Video', icon: <Video className="w-4 h-4" /> },
                    { id: 'audio', label: 'Audio', icon: <Mic className="w-4 h-4" /> }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-white/10 text-white shadow-sm border border-white/10' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Transfer Learning Domain Selector */}
            <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide hidden md:block">Model Context:</span>
                <div className="flex bg-black/60 rounded-xl p-1 border border-white/5 overflow-x-auto max-w-full no-scrollbar">
                    {domains.map(d => (
                         <button
                             key={d.id}
                             onClick={() => setDomain(d.id as any)}
                             className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                 domain === d.id 
                                 ? 'bg-white/10 text-white shadow-sm border border-white/10' 
                                 : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                             }`}
                         >
                             <span className={domain === d.id ? d.color : 'currentColor'}>{d.icon}</span>
                             <span>{d.label}</span>
                         </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="relative z-10 min-h-[300px] flex flex-col p-8">
          {activeTab === 'text' && (
            <div className="space-y-4 flex-1 animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-3">
                 <div className="flex bg-black/40 rounded-lg p-1 border border-white/10 overflow-x-auto max-w-full">
                     {platforms.map(p => (
                         <button
                             key={p.id}
                             onClick={() => setPlatform(p.id as any)}
                             className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                                 platform === p.id 
                                 ? 'bg-white/10 text-white shadow-sm' 
                                 : 'text-slate-500 hover:text-slate-300'
                             }`}
                         >
                             <span className={platform === p.id ? p.color : 'currentColor'}>{p.icon}</span>
                             <span>{p.label}</span>
                         </button>
                     ))}
                 </div>

                 <div className="flex space-x-2">
                     <button 
                        onClick={() => setIsDeepAgentMode(!isDeepAgentMode)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            isDeepAgentMode 
                            ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                            : 'bg-black/40 border-slate-700 text-slate-500 hover:bg-white/5'
                        }`}
                     >
                        <Bot className="w-3 h-3" />
                        <span>Deep Investigation Agent</span>
                     </button>
                 </div>
              </div>
              
              <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Paste content from ${platform} here for ${domain}-focused forensic analysis...`}
                    className="w-full h-56 bg-black/40 border border-white/10 rounded-xl p-5 text-slate-200 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 resize-none transition-all placeholder-slate-600 font-mono text-sm leading-relaxed"
                  />
                  {/* Real-time Heuristics HUD */}
                  {inputText.length > 0 && (
                      <div className="absolute bottom-4 right-4 flex space-x-4 bg-black/80 backdrop-blur-md p-2 rounded-lg border border-white/10">
                          <div className="flex items-center space-x-2">
                              <BarChart3 className="w-3 h-3 text-blue-400" />
                              <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-400 transition-all duration-300" style={{width: `${metrics.complexity}%`}}></div>
                              </div>
                              <span className="text-[9px] text-slate-400 font-mono">CMPLX</span>
                          </div>
                          <div className="flex items-center space-x-2">
                              <Zap className="w-3 h-3 text-yellow-400" />
                              <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                                  <div className={`h-full transition-all duration-300 ${metrics.urgency > 50 ? 'bg-red-500' : 'bg-yellow-400'}`} style={{width: `${metrics.urgency}%`}}></div>
                              </div>
                              <span className="text-[9px] text-slate-400 font-mono">URGENCY</span>
                          </div>
                      </div>
                  )}
              </div>

              {/* Quick Loaders */}
              <div className="flex justify-between items-center pt-2">
                  <div className="flex space-x-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase py-1.5">Quick Load:</span>
                      <button onClick={() => loadExample('fake')} className="text-[10px] px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded text-slate-300 border border-white/5 transition-colors">Data Leak</button>
                      <button onClick={() => loadExample('scam')} className="text-[10px] px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded text-slate-300 border border-white/5 transition-colors">Phishing</button>
                      <button onClick={() => loadExample('satire')} className="text-[10px] px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded text-slate-300 border border-white/5 transition-colors">Satire</button>
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">
                      {inputText.length} chars
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-6 flex-1 animate-fade-in flex flex-col justify-center">
              <div className="flex justify-between items-center mb-2">
                 <div className="flex bg-black/40 rounded-lg p-1 border border-white/10 overflow-x-auto max-w-full">
                     {platforms.map(p => (
                         <button
                             key={p.id}
                             onClick={() => setPlatform(p.id as any)}
                             className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                                 platform === p.id 
                                 ? 'bg-white/10 text-white shadow-sm' 
                                 : 'text-slate-500 hover:text-slate-300'
                             }`}
                         >
                             <span className={platform === p.id ? p.color : 'currentColor'}>{p.icon}</span>
                             <span>{p.label}</span>
                         </button>
                     ))}
                 </div>
                 <button 
                    onClick={() => setIsDeepAgentMode(!isDeepAgentMode)}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                        isDeepAgentMode 
                        ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                        : 'bg-black/40 border-slate-700 text-slate-500 hover:bg-white/5'
                    }`}
                 >
                    <Bot className="w-3 h-3" />
                    <span>Deep Investigation Agent</span>
                 </button>
              </div>
              <div className="relative group">
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                 <div className="relative flex items-center bg-black rounded-xl p-1 border border-white/10">
                    <div className="pl-4 text-slate-500">
                        <LinkIcon className="w-5 h-5" />
                    </div>
                    <input
                        type="url"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={`https://${platform.toLowerCase()}.com/post/...`}
                        className="w-full bg-transparent border-none text-white p-4 focus:outline-none font-mono"
                    />
                 </div>
              </div>
              <div className="flex justify-center">
                  <p className="text-xs text-slate-500 max-w-md text-center">
                      Engine will parse DOM structure, verify SSL certificates, and cross-reference domain age with known misinformation registries.
                  </p>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
             <div className="space-y-6 flex-1 animate-fade-in flex flex-col items-center justify-center">
                <div className={`
                    w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 relative group cursor-pointer
                    ${isRecording ? 'bg-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.4)]' : 'bg-slate-800/50 hover:bg-slate-800'}
                `}
                onClick={isRecording ? stopRecording : startRecording}
                >
                    {isRecording && (
                        <>
                            <div className="absolute inset-0 rounded-full border-4 border-red-500/50 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-pulse delay-75"></div>
                        </>
                    )}
                    {isRecording ? <MicOff className="w-12 h-12 text-red-500" /> : <Mic className="w-12 h-12 text-slate-400 group-hover:text-white" />}
                </div>

                <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">{isRecording ? "Listening..." : "Tap to Record"}</h3>
                    <p className="text-sm text-slate-400">
                        {isRecording ? "Analyzing prosody, breathing patterns, and digital artifacts..." : "Analyze voice for synthetic TTS or cloned audio."}
                    </p>
                </div>

                {audioBase64 && !isRecording && (
                    <div className="flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                        <Radio className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400 font-bold">Audio Captured</span>
                    </div>
                )}
             </div>
          )}

          {(activeTab === 'image' || activeTab === 'video') && (
            <div className="space-y-4 flex-1 animate-fade-in">
              <div 
                onClick={() => activeTab === 'image' ? fileInputRef.current?.click() : videoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                  (selectedImage || selectedVideo)
                    ? 'border-primary-500/50 bg-black/60' 
                    : 'border-slate-800 hover:border-slate-600 bg-black/40 hover:bg-black/60'
                }`}
              >
                {/* Simulated Scanning Grid on Hover */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                {selectedImage ? (
                   <div className="relative h-full w-full p-2">
                       <img src={selectedImage} alt="Preview" className="h-full w-full object-contain rounded-xl relative z-10" />
                       <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-2 py-1 rounded border border-white/10 text-[10px] text-green-400 font-mono flex items-center">
                           <ShieldCheck className="w-3 h-3 mr-1" /> Ready
                       </div>
                   </div>
                ) : selectedVideo ? (
                    <video 
                        ref={videoRef}
                        src={selectedVideo} 
                        className="h-4/5 w-full rounded-xl" 
                        controls
                        onLoadedData={(e) => { e.currentTarget.currentTime = 1; }}
                    />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-slate-900/80 flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        {activeTab === 'image' ? <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-primary-400" /> : <Video className="w-6 h-6 text-slate-400 group-hover:text-primary-400" />}
                    </div>
                    <p className="text-slate-300 font-medium text-lg">Upload {activeTab === 'image' ? 'Image' : 'Video'}</p>
                    <p className="text-xs text-slate-500 mt-2">Max 10MB - GAN/Diffusion Forensics</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoChange} />
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col items-end space-y-4">
            {isDeepAgentMode && isAnalyzing && (
                <div className="w-full bg-black/80 rounded-xl p-4 font-mono text-xs border border-green-500/20 text-green-400 h-32 overflow-y-auto shadow-inner custom-scrollbar">
                    <div className="flex items-center space-x-2 mb-2 border-b border-green-500/20 pb-1">
                        <Terminal className="w-3 h-3" />
                        <span>AGENT_ACTIVITY_LOG</span>
                    </div>
                    <div className="space-y-1">
                        {agentLogs.map((log, i) => (
                            <p key={i} className="animate-fade-in">{log}</p>
                        ))}
                        <span className="inline-block w-2 h-4 bg-green-500 animate-pulse align-middle"></span>
                    </div>
                </div>
            )}
            
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || 
                (activeTab === 'text' && !inputText) || 
                (activeTab === 'url' && !inputText) || 
                (activeTab === 'image' && !selectedImage) ||
                (activeTab === 'video' && !selectedVideo) ||
                (activeTab === 'audio' && !audioBase64)
              }
              className={`
                px-8 py-4 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center space-x-3 transition-all duration-300
                ${isAnalyzing 
                  ? 'bg-slate-800 cursor-wait border border-white/5' 
                  : isDeepAgentMode
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-[1.02] border border-transparent'
                  : 'bg-gradient-to-r from-primary-600 to-purple-600 hover:shadow-[0_0_25px_rgba(14,165,233,0.4)] hover:scale-[1.02] border border-transparent'}
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              `}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{isDeepAgentMode ? 'Agent Working...' : 'Running Inference...'}</span>
                </>
              ) : (
                <>
                  {isDeepAgentMode ? <Bot className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  <span>{isDeepAgentMode ? 'Launch Investigation' : 'Analyze Content'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};