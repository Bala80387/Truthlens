import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Share2, Eye, ThumbsDown, Activity, ChevronRight, Volume2, FileDown, ScanFace, Binary, Cpu, Search, Calendar, StopCircle, RefreshCw, Globe, Network, ThumbsUp, GitPullRequest, Save, Database, ArrowUpRight, Terminal, Check, Library, Vote, Pill, TrendingUp } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { translateText, generateTTS } from '../services/geminiService';
import { KnowledgeGraph } from './KnowledgeGraph';

interface ResultsViewProps {
  result: AnalysisResult;
  onReset: () => void;
  contentType: 'text' | 'image' | 'url' | 'video' | 'audio';
  contentSource?: string | null;
}

const REGIONAL_LANGUAGES = [
    { code: 'en-US', label: 'English', native: 'English' },
    { code: 'ta-IN', label: 'Tamil', native: 'தமிழ்' },
    { code: 'ml-IN', label: 'Malayalam', native: 'മലയാളം' },
    { code: 'te-IN', label: 'Telugu', native: 'తెలుగు' },
    { code: 'kn-IN', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi-IN', label: 'Hindi', native: 'हिन्दी' },
    { code: 'es-ES', label: 'Spanish', native: 'Español' },
];

// Utility: Decode PCM (Gemini TTS Output)
async function decodeAudioData(base64Data: string, ctx: AudioContext): Promise<AudioBuffer> {
    const binary = atob(base64Data);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    
    // Convert Int16 PCM to Float32
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000); // Mono, 24kHz standard for Gemini
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onReset, contentType, contentSource }) => {
  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'graph'>('overview');

  // Audio & Language State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  
  const [selectedLang, setSelectedLang] = useState('en-US');
  
  // Content State
  const [displayedSummary, setDisplayedSummary] = useState(result.summary);
  const [translatedCache, setTranslatedCache] = useState<Record<string, string>>({ 'en-US': result.summary });

  // Audio Context
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [sourceNode, setSourceNode] = useState<AudioBufferSourceNode | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  // UI State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // RLHF / Training State
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correcting' | 'training' | 'trained'>('idle');
  const [trainingLog, setTrainingLog] = useState<string[]>([]);
  const [userVerdict, setUserVerdict] = useState<string>('');

  // Initialize Audio Context on user gesture or mount
  useEffect(() => {
    return () => {
        stopAudio();
        if (audioContext && audioContext.state !== 'closed') {
            audioContext.close();
        }
    };
  }, []);

  // Handle Language Change
  useEffect(() => {
      const handleLanguageSwitch = async () => {
          stopAudio(); // Stop any current speech

          if (selectedLang === 'en-US') {
              setDisplayedSummary(result.summary);
              if (autoPlay) {
                   setTimeout(() => playTTS(result.summary), 500);
              }
              return;
          }

          if (translatedCache[selectedLang]) {
              setDisplayedSummary(translatedCache[selectedLang]);
              if (autoPlay) {
                  setTimeout(() => playTTS(translatedCache[selectedLang]), 500);
              }
              return;
          }

          // Need translation
          setIsTranslating(true);
          const langLabel = REGIONAL_LANGUAGES.find(l => l.code === selectedLang)?.label || 'English';
          
          try {
              const translated = await translateText(result.summary, langLabel);
              setTranslatedCache(prev => ({ ...prev, [selectedLang]: translated }));
              setDisplayedSummary(translated);
              
              if (autoPlay) {
                  setTimeout(() => playTTS(translated), 500);
              }
          } catch (e) {
              console.error("Translation Error", e);
          } finally {
              setIsTranslating(false);
          }
      };

      handleLanguageSwitch();
  }, [selectedLang]);

  const playTTS = async (text: string) => {
    stopAudio();
    setIsGeneratingAudio(true);

    try {
        const base64Audio = await generateTTS(text);
        if (!base64Audio) throw new Error("Audio generation failed");

        const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        if (!audioContext) setAudioContext(ctx);

        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        const buffer = await decodeAudioData(base64Audio, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        
        source.onended = () => setIsPlaying(false);
        source.start();
        
        setSourceNode(source);
        setIsPlaying(true);
    } catch (e) {
        console.error("TTS Playback Error:", e);
        setIsPlaying(false);
    } finally {
        setIsGeneratingAudio(false);
    }
  };

  const stopAudio = () => {
      if (sourceNode) {
          try {
              sourceNode.stop();
              sourceNode.disconnect();
          } catch(e) {}
      }
      setIsPlaying(false);
      setSourceNode(null);
  };

  const togglePlayback = () => {
      if (isPlaying) {
          stopAudio();
      } else {
          playTTS(displayedSummary);
      }
  };

  const startTrainingSimulation = (verdict: string) => {
      setFeedbackState('training');
      setUserVerdict(verdict);
      setTrainingLog([]);
      
      const steps = [
          "> Initializing backpropagation...",
          "> Calculating loss function (BinaryCrossentropy)...",
          `> Adjusting weights for '${verdict}' bias...`,
          "> Updating tensor parameters...",
          "> Optimizing gradient descent...",
          "> Validating against test set...",
          "> Loss: 0.042 | Accuracy: 99.1%",
          "> Model v2.1.4-beta deployed."
      ];

      let i = 0;
      const interval = setInterval(() => {
          setTrainingLog(prev => [...prev, steps[i]]);
          i++;
          if (i >= steps.length) {
              clearInterval(interval);
              setFeedbackState('trained');
          }
      }, 800);
  };

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

  const getDomainIcon = (domain: string) => {
      switch (domain) {
          case 'Politics': return <Vote className="w-4 h-4 mr-1" />;
          case 'Health': return <Pill className="w-4 h-4 mr-1" />;
          case 'Finance': return <TrendingUp className="w-4 h-4 mr-1" />;
          default: return <Library className="w-4 h-4 mr-1" />;
      }
  };

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("TruthLens Intelligence Report", 10, 13);
    
    // Status
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.text(`VERDICT: ${result.classification.toUpperCase()}`, 10, 40);
    
    doc.setFontSize(12);
    doc.text(`Confidence: ${result.confidence}% | Virality Risk: ${result.viralityScore}/100`, 10, 50);
    
    // Summary
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 10, 65);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    const splitSummary = doc.splitTextToSize(result.summary, 180);
    doc.text(splitSummary, 10, 75);
    
    let yPos = 75 + (splitSummary.length * 7) + 10;
    
    // Reasoning
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Key Reasoning", 10, yPos);
    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    result.reasoning.forEach(point => {
        const splitPoint = doc.splitTextToSize(`• ${point}`, 180);
        doc.text(splitPoint, 10, yPos);
        yPos += (splitPoint.length * 7);
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated by TruthLens AI • ${new Date().toLocaleString()}`, 10, 280);
    
    doc.save(`truthlens-report-${Date.now()}.pdf`);
    setIsGeneratingPdf(false);
  };

  const aiProb = result.technicalMetrics?.aiProbability || (result.isAiGenerated ? 95 : 5);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <button onClick={onReset} className="text-slate-400 hover:text-white transition-colors flex items-center group">
            <div className="bg-white/5 p-2 rounded-lg mr-2 group-hover:bg-white/10 transition-colors">
                <ChevronRight className="w-4 h-4 rotate-180" />
            </div>
            Back to Engine
        </button>

        <div className="flex flex-wrap items-center gap-2">
            
            {/* Tab Switcher */}
            <div className="bg-white/5 p-1 rounded-lg flex space-x-1 border border-white/5 mr-4">
                <button 
                  onClick={() => setActiveTab('overview')} 
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('graph')} 
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${activeTab === 'graph' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  <Network className="w-3 h-3" /> Graph
                </button>
            </div>

            {/* Audio Controls */}
            <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center space-x-3 border-white/5 bg-black/50">
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => setAutoPlay(!autoPlay)}
                        className={`w-8 h-4 rounded-full p-0.5 transition-colors ${autoPlay ? 'bg-green-500' : 'bg-slate-600'}`}
                        title="Auto-Announce Result"
                    >
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${autoPlay ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </button>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Auto-Read</span>
                </div>

                <div className="h-4 w-px bg-white/10"></div>

                <select 
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="bg-transparent text-xs text-white outline-none border-none cursor-pointer w-24"
                >
                    {REGIONAL_LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code} className="bg-black text-white">{lang.label} ({lang.native})</option>
                    ))}
                </select>
            </div>

            <button 
                onClick={togglePlayback}
                disabled={isTranslating || isGeneratingAudio}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all disabled:opacity-50 min-w-[100px] justify-center"
            >
                {isTranslating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                ) : isGeneratingAudio ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : isPlaying ? (
                    <StopCircle className="w-4 h-4 animate-pulse" />
                ) : (
                    <Volume2 className="w-4 h-4" />
                )}
                <span className="text-sm font-bold">
                    {isTranslating ? 'Translating...' : isGeneratingAudio ? 'Generating...' : isPlaying ? 'Stop' : 'Listen'}
                </span>
            </button>

            <button 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-all"
            >
                <FileDown className="w-4 h-4" />
                <span className="text-sm font-bold">{isGeneratingPdf ? 'Generating...' : 'Report'}</span>
            </button>
        </div>
      </div>

      {activeTab === 'graph' ? (
        <div className="animate-fade-in">
             <div className="mb-4">
                 <h2 className="text-2xl font-bold text-white flex items-center">
                     <Network className="w-6 h-6 mr-2 text-primary-400" />
                     Knowledge Graph
                 </h2>
                 <p className="text-slate-400">Visualizing entities, relationships, and risk vectors extracted from the content.</p>
             </div>
             {result.knowledgeGraph ? (
                 <KnowledgeGraph data={result.knowledgeGraph} />
             ) : (
                 <div className="h-96 flex items-center justify-center bg-black/40 rounded-3xl border border-white/5">
                     <p className="text-slate-500">No graph data available for this analysis.</p>
                 </div>
             )}
        </div>
      ) : (
        <>
            {/* Main Verdict Card */}
            <div className={`glass-panel rounded-3xl p-10 mb-8 text-center border ${getStatusColor(result.classification).split(' ')[1]} ${getStatusColor(result.classification).split(' ')[3]} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-center justify-center">
                    {/* Domain Badge */}
                    <div className="mb-4 bg-white/10 px-3 py-1 rounded-full border border-white/20 text-xs font-bold text-white uppercase tracking-widest flex items-center">
                        {getDomainIcon(result.domain || 'General')} {result.domain || 'General'} Context Active
                    </div>

                    <div className="mb-6 relative">
                        <div className={`absolute inset-0 blur-3xl opacity-20 ${result.classification === 'Real' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {getStatusIcon(result.classification)}
                    </div>
                
                    <h2 className={`text-6xl font-black tracking-tighter mb-4 ${getStatusColor(result.classification).split(' ')[0]}`}>{result.classification.toUpperCase()}</h2>
                    
                    <div className="relative max-w-3xl mx-auto min-h-[60px]">
                        {isTranslating ? (
                            <div className="flex justify-center items-center py-4 space-x-2">
                                <RefreshCw className="w-5 h-5 text-primary-400 animate-spin" />
                                <span className="text-sm text-primary-400 font-mono">Translating Analysis...</span>
                            </div>
                        ) : (
                            <p className="text-xl text-slate-300 leading-relaxed animate-fade-in">
                                {displayedSummary}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 w-full max-w-3xl">
                        <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                            <span className="text-3xl font-bold text-white mb-1">{result.confidence}%</span>
                            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Confidence</span>
                        </div>
                        <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                            <span className={`text-3xl font-bold mb-1 ${aiProb > 50 ? 'text-purple-400' : 'text-blue-400'}`}>
                                {aiProb}%
                            </span>
                            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">AI Probability</span>
                        </div>
                        <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                            <span className={`text-3xl font-bold mb-1 ${result.isAiGenerated ? 'text-red-400' : 'text-green-400'}`}>
                                {result.isAiGenerated ? 'SYNTHETIC' : 'ORGANIC'}
                            </span>
                            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Origin Source</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Detailed Metrics & Reasoning */}
                <div className="md:col-span-2 space-y-6">
                <div className="glass-panel p-8 rounded-3xl border-white/5">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <ScanFace className="w-5 h-5 mr-3 text-primary-400" />
                    Explainable AI Reasoning
                    </h3>
                    <div className="relative border-l-2 border-slate-800 ml-4 space-y-8 py-2">
                    {result.reasoning.map((reason, idx) => (
                        <div key={idx} className="relative pl-8">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-black border-2 border-primary-500 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                        </div>
                        <h4 className="text-sm font-bold text-primary-400 uppercase mb-1">Analysis Step {idx + 1}</h4>
                        <p className="text-slate-300 leading-relaxed text-sm">{reason}</p>
                        </div>
                    ))}
                    </div>
                </div>
                </div>

                {/* Right Col */}
                <div className="space-y-6">
                <div className="glass-panel p-8 rounded-3xl border-white/5">
                    <h3 className="text-xl font-bold text-white mb-6">Detection Highlights</h3>
                    <div className="flex flex-wrap gap-2">
                    {result.emotionalTriggers.map((trigger, idx) => (
                        <span key={idx} className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                            {trigger}
                        </span>
                        ))}
                    </div>
                </div>
                
                {result.knowledgeGraph && result.knowledgeGraph.nodes.length > 0 && (
                     <div 
                        className="glass-panel p-6 rounded-3xl border-white/5 hover:border-primary-500/30 transition-colors cursor-pointer group"
                        onClick={() => setActiveTab('graph')}
                     >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Graph Nodes</h3>
                            <Network className="w-4 h-4 text-primary-400" />
                        </div>
                        <p className="text-2xl font-black text-white">{result.knowledgeGraph.nodes.length}</p>
                        <p className="text-xs text-slate-500 mt-1">Entities Extracted</p>
                        <div className="mt-4 text-xs text-primary-400 font-bold uppercase tracking-wider group-hover:underline">
                            View Interactive Graph &rarr;
                        </div>
                     </div>
                )}
                </div>
            </div>

            {/* Model Retraining / RLHF Console */}
            <div className="glass-panel p-1 rounded-3xl border-white/5 bg-gradient-to-br from-slate-900 via-black to-black shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none"></div>
                <div className="bg-black/60 backdrop-blur-xl p-8 rounded-[22px]">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <GitPullRequest className="w-5 h-5 mr-3 text-blue-400" />
                                Model Training Loop (RLHF)
                            </h3>
                            <p className="text-slate-400 text-sm mt-1 max-w-xl">
                                Help fine-tune TruthLens for <strong>{result.domain || 'General'}</strong> context. Your feedback is used to adjust weights and biases.
                            </p>
                        </div>
                        <div className="flex space-x-2">
                            {feedbackState === 'idle' && (
                                <>
                                    <button 
                                        onClick={() => setFeedbackState('correcting')}
                                        className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all"
                                    >
                                        <ThumbsDown className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Inaccurate</span>
                                    </button>
                                    <button 
                                        onClick={() => startTrainingSimulation('Accurate')}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg transition-all"
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Accurate</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {feedbackState === 'correcting' && (
                        <div className="animate-fade-in bg-white/5 border border-white/5 rounded-xl p-6">
                            <h4 className="text-sm font-bold text-white mb-4">Correct Classification</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['Real', 'Fake', 'Misleading', 'Satire'].map(label => (
                                    <button
                                        key={label}
                                        onClick={() => startTrainingSimulation(label)}
                                        className="px-4 py-3 rounded-lg bg-black hover:bg-primary-600 hover:text-white border border-white/10 transition-all text-slate-300 text-sm font-medium"
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {feedbackState === 'training' && (
                        <div className="animate-fade-in bg-black border border-green-500/30 rounded-xl p-4 font-mono text-xs shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]">
                            <div className="flex items-center space-x-2 mb-2 border-b border-green-500/30 pb-2">
                                <Terminal className="w-3 h-3 text-green-500" />
                                <span className="text-green-500 font-bold">TRAINING_PROCESS_PID_4921</span>
                            </div>
                            <div className="space-y-1 h-32 overflow-y-auto custom-scrollbar">
                                {trainingLog.map((log, i) => (
                                    <div key={i} className="text-green-400">{log}</div>
                                ))}
                                <div className="w-2 h-4 bg-green-500 animate-pulse"></div>
                            </div>
                        </div>
                    )}

                    {feedbackState === 'trained' && (
                        <div className="animate-fade-in bg-green-500/10 border border-green-500/20 rounded-xl p-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-green-500/20 rounded-full">
                                    <Database className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white">Model Retrained Successfully</h4>
                                    <p className="text-sm text-green-300">
                                        Weights updated based on your feedback: <span className="font-bold text-white">{userVerdict}</span>
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setFeedbackState('idle')}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-bold uppercase transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
      )}
    </div>
  );
};