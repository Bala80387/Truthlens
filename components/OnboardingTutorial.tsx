import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Search, Globe, Map, Shield, ChevronRight, X } from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    title: "Welcome to TruthLens",
    description: "Your AI-powered cognitive security engine. We help you navigate the digital landscape by detecting misinformation, deepfakes, and synthetic content.",
    icon: <ShieldCheck className="w-12 h-12 text-primary-400" />
  },
  {
    title: "The Analyzer",
    description: "Upload text, images, videos, or audio to detect deepfakes, synthetic text, and verify claims across multiple modalities using advanced AI forensics.",
    icon: <Search className="w-12 h-12 text-purple-400" />
  },
  {
    title: "Real-Time News",
    description: "Monitor global news streams for emerging misinformation narratives and track their virality in real-time.",
    icon: <Globe className="w-12 h-12 text-blue-400" />
  },
  {
    title: "Geo-Threat Map",
    description: "Visualize active disinformation campaigns globally and understand the geopolitical impact of coordinated inauthentic behavior.",
    icon: <Map className="w-12 h-12 text-green-400" />
  },
  {
    title: "Social Shield",
    description: "Connect your social media accounts to automatically scan your feeds for manipulative content and bot activity.",
    icon: <Shield className="w-12 h-12 text-red-400" />
  }
];

export const OnboardingTutorial: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('truthlens_tutorial_seen');
    if (!hasSeenTutorial) {
      // Small delay to let the app load first
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('truthlens_tutorial_seen', 'true');
  };

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
          
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mt-4">
            <div className="mb-6 p-4 bg-black/40 rounded-full border border-white/5">
              {TUTORIAL_STEPS[currentStep].icon}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              {TUTORIAL_STEPS[currentStep].title}
            </h2>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-8 min-h-[80px]">
              {TUTORIAL_STEPS[currentStep].description}
            </p>

            {/* Progress Dots */}
            <div className="flex space-x-2 mb-8">
              {TUTORIAL_STEPS.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-6 bg-primary-500' : 'w-1.5 bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex w-full space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.3)]"
              >
                {currentStep === TUTORIAL_STEPS.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < TUTORIAL_STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
