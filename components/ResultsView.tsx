import React, { useState, useRef } from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Share2, Shield, Eye, ThumbsDown, Activity, ChevronRight, Lock, Volume2, FileDown, Mic, FileText, Link as LinkIcon, ScanFace, Binary, Cpu, BarChart2, Radio, Globe, Search, Calendar } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { generateAudioReport } from '../services/geminiService';

interface ResultsViewProps {
  result: AnalysisResult;
  onReset: () => void;
}

// Helper to decode Base64 string to Uint8Array
function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to convert raw PCM (Int16) bytes to AudioBuffer
function pcmToAudioBuffer(data: Uint8Array, ctx: AudioContext, sampleRate: number = 24000): AudioBuffer {
  // Create an Int16 view of the byte buffer
  const pcm16 = new Int16Array(data.buffer, data.byteOffset, data.length / 2);
  
  // Create an empty AudioBuffer
  const buffer = ctx.createBuffer(1, pcm16.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  // Convert Int16 to Float32 [-1.0, 1.0]
  for (let i = 0; i < pcm16.length; i++) {
     channelData[i] = pcm16[i] / 32768.0;
  }
  return buffer;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('female');
  
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

    // Fact Checks
    if (result.factChecks.length > 0) {
        yPos += 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Fact Checks", 10, yPos);
        yPos += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        result.factChecks.forEach(check => {
            const line = `[${check.verdict}] ${check.claim} (Source: ${check.source})`;
            const splitLine = doc.splitTextToSize(line, 180);
            doc.text(splitLine, 10, yPos);
            yPos += (splitLine.length * 6) + 2;
        });
    }
    
    // Investigation Results
    if (result.investigation) {
        yPos += 10;
        doc.addPage();
        yPos = 20;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Deep Investigation Dossier", 10, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        const verdict = doc.splitTextToSize(result.investigation.verdict, 180);
        doc.text(verdict, 10, yPos);
        yPos += (verdict.length * 7) + 10;
        
        doc.setFontSize(12);
        doc.text("Identified Sources:", 10, yPos);
        yPos += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        result.investigation.sources.forEach(src => {
            const line = `${src.title} (${src.source})`;
            doc.text(line, 10, yPos);
            yPos += 6;
        });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated by TruthLens AI • ${new Date().toLocaleString()}`, 10, 280);
    
    doc.save(`truthlens-report-${Date.now()}.pdf`);
    setIsGeneratingPdf(false);
  };

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    try {
        const audioData = await generateAudioReport(result.summary, result.classification, selectedLanguage, selectedGender);
        
        if (audioData) {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
            // 1. Decode Base64 to raw bytes
            const bytes = base64ToBytes(audioData);
            // 2. Convert raw PCM bytes to AudioBuffer
            const audioBuffer = pcmToAudioBuffer(bytes, audioContext);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start(0);
            
            source.onended = () => setIsPlaying(false);
        } else {
            setIsPlaying(false);
        }
    } catch (e) {
        console.error("Failed to play audio", e);
        alert("Failed to generate voice report. The text may be too long or the service is temporarily unavailable.");
        setIsPlaying(false);
    }
  };

  const aiProb = result.technicalMetrics?.aiProbability || (result.isAiGenerated ? 95 : 5);
  const isAudio = result.technicalMetrics?.aiProbability !== undefined && result.technicalMetrics.bertLinguisticScore === 0 && result.technicalMetrics.vitVisualArtifacts === 0;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onReset} className="text-slate-400 hover:text-white transition-colors flex items-center group">
            <div className="bg-white/5 p-2 rounded-lg mr-2 group-hover:bg-white/10 transition-colors">
                <ChevronRight className="w-4 h-4 rotate-180" />
            </div>
            Back to Engine
        </button>

        <div className="flex items-center space-x-2">
            {/* Voice Controls */}
            <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center space-x-2 border-white/5 bg-black/50">
                <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-transparent text-xs text-white outline-none border-none cursor-pointer"
                >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                </select>
                <div className="h-4 w-px bg-white/20"></div>
                <button 
                    onClick={() => setSelectedGender('male')}
                    className={`text-xs px-2 py-0.5 rounded ${selectedGender === 'male' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500'}`}
                >
                    Male
                </button>
                <button 
                    onClick={() => setSelectedGender('female')}
                    className={`text-xs px-2 py-0.5 rounded ${selectedGender === 'female' ? 'bg-pink-500/20 text-pink-400' : 'text-slate-500'}`}
                >
                    Female
                </button>
            </div>

            <button 
                onClick={handlePlayAudio}
                disabled={isPlaying}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all disabled:opacity-50"
            >
                {isPlaying ? (
                    <div className="flex space-x-1 items-center">
                        <span className="w-1 h-3 bg-indigo-400 animate-pulse"></span>
                        <span className="w-1 h-2 bg-indigo-400 animate-pulse delay-75"></span>
                        <span className="w-1 h-3 bg-indigo-400 animate-pulse delay-150"></span>
                    </div>
                ) : (
                    <Volume2 className="w-4 h-4" />
                )}
                <span className="text-sm font-bold">Listen</span>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Reasoning & Evidence */}
        <div className="md:col-span-2 space-y-6">

          {/* Deep Investigation Report (If available) */}
          {result.investigation && (
              <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 bg-purple-900/10 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                  <div className="flex items-center space-x-3 mb-6 relative z-10">
                      <Search className="w-6 h-6 text-purple-400" />
                      <h3 className="text-xl font-bold text-white">Investigation Dossier</h3>
                      <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] uppercase font-bold rounded">Agent Report</span>
                  </div>

                  <div className="space-y-6 relative z-10">
                      <div className="bg-black/40 p-5 rounded-xl border border-white/10">
                          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Agent Verdict</h4>
                          <p className="text-slate-200 leading-relaxed">{result.investigation.verdict}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                                  <Globe className="w-3 h-3 mr-2" /> Corroborating Sources
                              </h4>
                              <ul className="space-y-2">
                                  {result.investigation.sources.slice(0, 4).map((source, i) => (
                                      <li key={i}>
                                          <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 flex items-center truncate transition-colors">
                                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 flex-shrink-0"></span>
                                              <span className="truncate">{source.title}</span>
                                              <span className="text-slate-600 ml-1 text-[10px] hidden sm:inline">({source.source})</span>
                                          </a>
                                      </li>
                                  ))}
                              </ul>
                          </div>

                          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                                  <Calendar className="w-3 h-3 mr-2" /> Timeline Construction
                              </h4>
                              <div className="space-y-3 pl-1">
                                  {result.investigation.timeline.length > 0 ? result.investigation.timeline.slice(0, 3).map((item, i) => (
                                      <div key={i} className="flex flex-col border-l border-slate-700 pl-3 relative">
                                          <span className="w-2 h-2 rounded-full bg-slate-600 absolute -left-[4.5px] top-1"></span>
                                          <span className="text-[10px] text-slate-400 font-mono mb-0.5">{item.date}</span>
                                          <span className="text-xs text-slate-300">{item.event}</span>
                                      </div>
                                  )) : (
                                      <p className="text-xs text-slate-600 italic">No timeline data available for this claim.</p>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}
          
          {/* Neural Diagnostics Module */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <Cpu className="w-6 h-6 text-primary-400" />
                <h3 className="text-xl font-bold text-white">AI Content Detection</h3>
              </div>
              
              <div className="mb-6">
                 <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-400">Human vs AI Spectrum</span>
                    <span className="text-sm font-bold text-white">{aiProb}% AI Likelihood</span>
                 </div>
                 <div className="h-4 bg-slate-800 rounded-full relative overflow-hidden">
                    <div 
                        className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${aiProb > 50 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-green-500 to-blue-400'}`} 
                        style={{width: `${aiProb}%`}}
                    ></div>
                 </div>
                 <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>100% Human</span>
                    <span>100% AI</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Perplexity / Text Complexity */}
                 <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs text-slate-400 font-bold uppercase">Perplexity Score</span>
                       <span className="text-xs font-mono text-white">{result.technicalMetrics?.perplexityScore || 0}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mb-2">
                       <div className="h-full bg-blue-500 rounded-full" style={{width: `${result.technicalMetrics?.perplexityScore || 0}%`}}></div>
                    </div>
                    <p className="text-[10px] text-slate-500">Measures text complexity. Low scores often indicate AI.</p>
                 </div>

                 {/* Burstiness / Sentence Variation */}
                 <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs text-slate-400 font-bold uppercase">Burstiness Score</span>
                       <span className="text-xs font-mono text-white">{result.technicalMetrics?.burstinessScore || 0}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mb-2">
                       <div className="h-full bg-green-500 rounded-full" style={{width: `${result.technicalMetrics?.burstinessScore || 0}%`}}></div>
                    </div>
                    <p className="text-[10px] text-slate-500">Measures sentence variation. AI tends to be monotonous.</p>
                 </div>
              </div>
          </div>

          {/* Explainable AI Logic Chain */}
          <div className="glass-panel p-8 rounded-3xl border-white/5">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-3 text-primary-400" />
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

        {/* Right Col: Emotional & Actions */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl border-white/5">
            <h3 className="text-xl font-bold text-white mb-6">Detection Highlights</h3>
            <div className="flex flex-wrap gap-2">
              {result.isAiGenerated ? (
                  <>
                     <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Synthetic Pattern
                     </span>
                     <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Low Perplexity
                     </span>
                  </>
              ) : (
                  <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                     Human Nuance
                  </span>
              )}
               {result.emotionalTriggers.map((trigger, idx) => (
                  <span key={idx} className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                    {trigger}
                  </span>
                ))}
            </div>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                {result.isAiGenerated 
                    ? "Content exhibits statistical patterns consistent with Large Language Models (LLMs) or TTS engines." 
                    : "Content exhibits variations in structure and tone consistent with human authorship."}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-primary-500/30 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-[50px] -mr-10 -mt-10"></div>
            <h3 className="text-lg font-bold text-white mb-4 relative z-10">Actionable Intel</h3>
            
            <div className="space-y-3 relative z-10">
              <button className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/5">
                 <ThumbsDown className="w-4 h-4" />
                 <span>Flag as AI Content</span>
              </button>
              <button className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl transition-all font-bold ${
                result.classification === 'Real' 
                ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}>
                 <Share2 className="w-4 h-4" />
                 <span>Verify & Share</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};