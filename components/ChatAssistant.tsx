
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Mic, Volume2, MicOff, VolumeX, Bot, User, Minimize2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
        id: 'init',
        role: 'model',
        text: 'Hello! I am your TruthLens Assistant. Ask me anything about verification, misinformation, or how to use this dashboard.',
        timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize GenAI
  const apiKey = process.env.API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  useEffect(() => {
      // Scroll to bottom on new message
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
      if ('webkitSpeechRecognition' in window) {
          const SpeechRecognition = (window as any).webkitSpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.lang = 'en-US';

          recognitionRef.current.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript;
              setInputText(transcript);
              handleSend(transcript);
          };

          recognitionRef.current.onend = () => {
              setIsListening(false);
          };
      }
  }, []);

  const toggleListening = () => {
      if (isListening) {
          recognitionRef.current?.stop();
          setIsListening(false);
      } else {
          recognitionRef.current?.start();
          setIsListening(true);
      }
  };

  const speak = (text: string) => {
      if (!voiceEnabled) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textOverride?: string) => {
      const text = textOverride || inputText;
      if (!text.trim() || !ai) return;

      // Add user message
      const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
      setMessages(prev => [...prev, userMsg]);
      setInputText('');
      setIsProcessing(true);

      try {
          const model = ai.models;
          const systemInstruction = "You are the TruthLens Assistant, an expert in cognitive security, misinformation detection, and fact-checking. Keep answers concise, helpful, and focused on truth verification.";
          
          const response = await model.generateContent({
              model: 'gemini-3-flash-preview',
              contents: text,
              config: {
                  systemInstruction: systemInstruction
              }
          });

          const reply = response.text || "I couldn't process that request.";
          
          const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: reply, timestamp: Date.now() };
          setMessages(prev => [...prev, botMsg]);
          
          if (voiceEnabled) {
              speak(reply);
          }

      } catch (e) {
          console.error(e);
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I'm having trouble connecting to the TruthLens network.", timestamp: Date.now() }]);
      } finally {
          setIsProcessing(false);
      }
  };

  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.5)] flex items-center justify-center hover:scale-110 transition-transform hover:bg-primary-500 group"
          >
              <MessageCircle className="w-7 h-7 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black"></div>
          </button>
      );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'w-72 h-14' : 'w-80 md:w-96 h-[500px]'}`}>
        {/* Header */}
        <div className="bg-primary-600 rounded-t-2xl p-4 flex items-center justify-between shadow-lg cursor-pointer" onClick={() => !isMinimized && setIsMinimized(!isMinimized)}>
            <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm">TruthLens Assistant</h3>
                    <div className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-primary-100">Online</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-1">
                <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1.5 hover:bg-white/10 rounded-full text-white">
                    <Minimize2 className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1.5 hover:bg-white/10 rounded-full text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Body */}
        {!isMinimized && (
            <div className="flex-1 bg-surfaceHighlight border-x border-b border-white/10 rounded-b-2xl flex flex-col overflow-hidden shadow-2xl">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/40">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                msg.role === 'user' 
                                ? 'bg-primary-600 text-white rounded-br-none' 
                                : 'bg-white/10 text-slate-200 rounded-bl-none border border-white/5'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isProcessing && (
                         <div className="flex justify-start">
                             <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none flex space-x-1">
                                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                             </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-black/60 border-t border-white/10">
                    <div className="relative flex items-center bg-white/5 rounded-xl border border-white/10 focus-within:border-primary-500/50 transition-colors">
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type or speak..."
                            className="flex-1 bg-transparent border-none text-white text-sm p-3 focus:outline-none placeholder-slate-500"
                        />
                        
                        <div className="flex items-center pr-2 space-x-1">
                            <button 
                                onClick={toggleListening}
                                className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-slate-400 hover:text-white'}`}
                            >
                                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>
                            
                            <button 
                                onClick={() => handleSend()}
                                disabled={!inputText.trim()}
                                className="p-2 bg-primary-600 rounded-lg text-white disabled:opacity-50 disabled:bg-slate-700 hover:bg-primary-500 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 px-1">
                         <button 
                            onClick={() => { setVoiceEnabled(!voiceEnabled); window.speechSynthesis.cancel(); }}
                            className="text-[10px] text-slate-500 flex items-center hover:text-white transition-colors"
                         >
                            {voiceEnabled ? <Volume2 className="w-3 h-3 mr-1" /> : <VolumeX className="w-3 h-3 mr-1" />}
                            {voiceEnabled ? 'Voice Output On' : 'Voice Output Off'}
                         </button>
                         <span className="text-[10px] text-slate-600">Gemini 3 Flash</span>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
