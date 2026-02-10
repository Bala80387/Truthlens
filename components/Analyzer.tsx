import React, { useState, useRef } from 'react';
import { Upload, Type, Link as LinkIcon, Image as ImageIcon, Sparkles, AlertCircle, Globe, Search } from 'lucide-react';
import { analyzeContent } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { ResultsView } from './ResultsView';

interface AnalyzerProps {
  initialText?: string;
  onAnalysisComplete: (result: AnalysisResult, content: string, type: 'text' | 'image' | 'url') => void;
}

export const Analyzer: React.FC<AnalyzerProps> = ({ initialText, onAnalysisComplete }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'url'>('text');
  const [inputText, setInputText] = useState(initialText || '');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update input text if prop changes
  React.useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      setActiveTab('text');
    }
  }, [initialText]);

  const handleAnalyze = async () => {
    const hasContent = 
      (activeTab === 'text' && inputText.trim()) || 
      (activeTab === 'url' && inputText.trim()) || 
      (activeTab === 'image' && selectedImage);

    if (!hasContent) return;

    setIsAnalyzing(true);
    try {
      let contentToAnalyze = inputText;
      let analysisType = activeTab;

      // Prepare payload
      const analysis = await analyzeContent(
        inputText, 
        activeTab,
        activeTab === 'image' && selectedImage ? selectedImage.split(',')[1] : undefined
      );
      
      setResult(analysis);
      onAnalysisComplete(analysis, activeTab === 'image' ? (selectedImage || '') : inputText, activeTab);

    } catch (e) {
      console.error(e);
      alert("Analysis failed. Please check your connection or API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (result) {
    return <ResultsView result={result} onReset={() => {
      setResult(null);
      setInputText('');
      setSelectedImage(null);
    }} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-6 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
          Verify. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-500 neon-text">Understand.</span> Trust.
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto">
          Advanced cognitive security engine. Detect misinformation in text, images, and URLs instantly.
        </p>
      </div>

      <div className="glass-panel p-1.5 rounded-2xl mb-8 flex space-x-1 max-w-2xl mx-auto bg-black/60">
        {[
            { id: 'text', label: 'Text Analysis', icon: <Type className="w-4 h-4" /> },
            { id: 'url', label: 'URL Scanner', icon: <Globe className="w-4 h-4" /> },
            { id: 'image', label: 'Visual Forensics', icon: <ImageIcon className="w-4 h-4" /> }
        ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center space-x-2 font-medium transition-all duration-300 ${
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
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste news text, social media posts, or statements here..."
                className="w-full h-56 bg-black/40 border border-white/10 rounded-xl p-5 text-slate-200 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 resize-none transition-all placeholder-slate-600 font-mono text-sm leading-relaxed"
              />
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-6 flex-1 animate-fade-in flex flex-col justify-center">
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
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start space-x-3">
                 <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                 <p className="text-sm text-blue-200/80">
                    Engine will analyze domain reputation, WHOIS data patterns, and content structure for phishing or satire indicators.
                 </p>
              </div>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="space-y-4 flex-1 animate-fade-in">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  selectedImage 
                    ? 'border-primary-500/50 bg-black/60' 
                    : 'border-slate-800 hover:border-slate-600 bg-black/40 hover:bg-black/60'
                }`}
              >
                {selectedImage ? (
                   <div className="relative w-full h-full p-2 group">
                      <img src={selectedImage} alt="Preview" className="h-full w-full object-contain rounded-xl" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                          <p className="text-white font-medium">Click to change</p>
                      </div>
                   </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-slate-900/80 flex items-center justify-center mb-4 border border-white/5">
                        <Upload className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-300 font-medium text-lg">Upload Media</p>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG (Max 10MB)</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (activeTab !== 'image' && !inputText) || (activeTab === 'image' && !selectedImage)}
              className={`
                px-8 py-4 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center space-x-3 transition-all duration-300
                ${isAnalyzing 
                  ? 'bg-slate-800 cursor-wait border border-white/5' 
                  : 'bg-gradient-to-r from-primary-600 to-purple-600 hover:shadow-[0_0_25px_rgba(14,165,233,0.4)] hover:scale-[1.02] border border-transparent'}
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              `}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Running Inference...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze Content</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
