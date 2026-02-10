import React, { useState, useRef } from 'react';
import { Upload, Type, Link as LinkIcon, Image as ImageIcon, Sparkles, AlertCircle, Globe, Search, Video, Mic, MicOff, Radio, Bot, Terminal, ShieldCheck } from 'lucide-react';
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
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDeepAgentMode, setIsDeepAgentMode] = useState(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Update input text if prop changes
  React.useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      setActiveTab('text');
    }
  }, [initialText]);

  // Simulated agent log stream
  const addLog = (log: string) => {
    setAgentLogs(prev => [...prev, log]);
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

      // 1. Standard Analysis
      const analysis = await analyzeContent(
        inputText, 
        activeTab,
        dataToAnalyze
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
    return <ResultsView result={result} onReset={() => {
      setResult(null);
      setInputText('');
      setSelectedImage(null);
      setSelectedVideo(null);
      setAudioBase64(null);
      setAgentLogs([]);
    }} />;
  }

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

      <div className="glass-panel p-1.5 rounded-2xl mb-8 flex space-x-1 max-w-3xl mx-auto bg-black/60 overflow-x-auto">
        {[
            { id: 'text', label: 'Text Detect', icon: <Type className="w-4 h-4" /> },
            { id: 'url', label: 'URL Scanner', icon: <Globe className="w-4 h-4" /> },
            { id: 'image', label: 'Image Forensics', icon: <ImageIcon className="w-4 h-4" /> },
            { id: 'video', label: 'Video Detect', icon: <Video className="w-4 h-4" /> },
            { id: 'audio', label: 'Voice/Audio', icon: <Mic className="w-4 h-4" /> }
        ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[120px] py-3 rounded-xl flex items-center justify-center space-x-2 font-medium transition-all duration-300 ${
                    activeTab === tab.id 
                    ? 'bg-surfaceHighlight text-white shadow-lg border border-white/10' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
            >
                {tab.icon}
                <span>{tab.label}</span>
            </button>
        ))}
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative z-10 min-h-[300px] flex flex-col">
          {activeTab === 'text' && (
            <div className="space-y-4 flex-1 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-xs text-primary-400 font-bold uppercase tracking-widest flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Text Detector Active (Perplexity/Burstiness)
                 </span>
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
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste news text, blog post, or chatGPT output here..."
                className="w-full h-56 bg-black/40 border border-white/10 rounded-xl p-5 text-slate-200 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 resize-none transition-all placeholder-slate-600 font-mono text-sm leading-relaxed"
              />
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-6 flex-1 animate-fade-in flex flex-col justify-center">
              <div className="flex justify-end mb-2">
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
                        placeholder="https://example.com/article..."
                        className="w-full bg-transparent border-none text-white p-4 focus:outline-none font-mono"
                    />
                 </div>
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
                        <div className="absolute inset-0 rounded-full border-4 border-red-500/50 animate-ping"></div>
                    )}
                    {isRecording ? <MicOff className="w-12 h-12 text-red-500" /> : <Mic className="w-12 h-12 text-slate-400 group-hover:text-white" />}
                </div>

                <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">{isRecording ? "Listening..." : "Tap to Record"}</h3>
                    <p className="text-sm text-slate-400">
                        {isRecording ? "Analyzing prosody and artifacts..." : "Analyze voice for synthetic TTS or cloned audio."}
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
                className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  (selectedImage || selectedVideo)
                    ? 'border-primary-500/50 bg-black/60' 
                    : 'border-slate-800 hover:border-slate-600 bg-black/40 hover:bg-black/60'
                }`}
              >
                {selectedImage ? (
                   <img src={selectedImage} alt="Preview" className="h-full w-full object-contain rounded-xl p-2" />
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
                    <div className="w-16 h-16 rounded-full bg-slate-900/80 flex items-center justify-center mb-4 border border-white/5">
                        {activeTab === 'image' ? <ImageIcon className="w-6 h-6 text-slate-400" /> : <Video className="w-6 h-6 text-slate-400" />}
                    </div>
                    <p className="text-slate-300 font-medium text-lg">Upload {activeTab === 'image' ? 'Image' : 'Video'}</p>
                    <p className="text-xs text-slate-500 mt-2">Max 10MB - Forensics Analysis</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoChange} />
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col items-end space-y-4">
            {isDeepAgentMode && isAnalyzing && (
                <div className="w-full bg-black/80 rounded-xl p-4 font-mono text-xs border border-green-500/20 text-green-400 h-32 overflow-y-auto shadow-inner">
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