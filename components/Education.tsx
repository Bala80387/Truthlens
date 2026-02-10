import React, { useState } from 'react';
import { Award, ChevronRight, Check, X, BookOpen, PlayCircle } from 'lucide-react';
import { QuizQuestion } from '../types';

const SAMPLE_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    scenario: "You see a headline: 'SHOCKING: Government Admits Aliens Built the Pyramids! Documents Leaked!' accompanied by a blurry image of a document.",
    options: ["Share it immediately, it's huge news.", "Ignore it, aliens aren't real.", "Check reputable news sources and fact-checking sites for verification.", "Post it asking friends if it's true."],
    correctIndex: 2,
    explanation: "Sensationalist language ('SHOCKING'), all caps, and lack of reputable sources are classic signs of clickbait or fake news. Always verify with trusted outlets."
  },
  {
    id: 2,
    scenario: "A video showing a politician saying something controversial looks slightly unnatural around the mouth area and the audio is slightly out of sync.",
    options: ["It's probably just a glitchy connection.", "This could be a Deepfake. Search for the original context.", "They definitely said it, video doesn't lie.", "Share it to expose them."],
    correctIndex: 1,
    explanation: "Unnatural facial movements and sync issues are hallmarks of Deepfakes. Searching for the original event usually clarifies the context."
  }
];

export const Education: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleOptionClick = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
    if (index === SAMPLE_QUIZ[currentQuestion].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowResult(false);
    if (currentQuestion < SAMPLE_QUIZ.length - 1) {
      setCurrentQuestion(c => c + 1);
    } else {
      // Reset logic
      setCurrentQuestion(0);
      setScore(0);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Truth Academy</h2>
          <p className="text-slate-400">Sharpen your critical thinking skills against misinformation.</p>
        </div>
        <div className="glass-panel px-5 py-3 rounded-2xl flex items-center space-x-3 border-orange-500/20 bg-orange-500/5">
           <div className="bg-orange-500/20 p-2 rounded-lg">
             <Award className="text-orange-400 w-6 h-6" />
           </div>
           <div>
             <span className="block text-xs text-orange-300 uppercase font-bold tracking-wider">Your Rank</span>
             <span className="block text-white font-bold text-lg">Fact Checker Lvl 1</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Cards */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-primary-500 group cursor-pointer hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between mb-3">
               <h4 className="text-white font-bold text-lg">Daily Case Study</h4>
               <BookOpen className="w-5 h-5 text-primary-400" />
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              How a single doctored image impacted the 2024 stock market for 15 minutes.
            </p>
            <span className="text-xs text-primary-400 font-bold uppercase tracking-wider group-hover:underline decoration-primary-400 underline-offset-4">Read Analysis &rarr;</span>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-purple-500 group cursor-pointer hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between mb-3">
               <h4 className="text-white font-bold text-lg">Deepfake Spotting</h4>
               <PlayCircle className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Learn the 5 visual artifacts that give away AI-generated videos.
            </p>
            <span className="text-xs text-purple-400 font-bold uppercase tracking-wider group-hover:underline decoration-purple-400 underline-offset-4">Start Lesson &rarr;</span>
          </div>
        </div>

        {/* Quiz Area */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border-white/10">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <Award className="w-64 h-64 text-white -mr-10 -mt-10" />
             </div>

             <div className="relative z-10">
               <div className="flex items-center space-x-2 mb-6">
                  <span className="text-xs font-bold bg-white/10 text-white px-2 py-1 rounded">Quiz</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question {currentQuestion + 1} of {SAMPLE_QUIZ.length}</span>
               </div>
               
               <h3 className="text-2xl text-white font-semibold mb-8 leading-snug">
                 {SAMPLE_QUIZ[currentQuestion].scenario}
               </h3>

               <div className="space-y-3">
                 {SAMPLE_QUIZ[currentQuestion].options.map((option, idx) => {
                   let btnClass = "w-full text-left p-5 rounded-xl border transition-all duration-200 relative overflow-hidden ";
                   if (showResult) {
                     if (idx === SAMPLE_QUIZ[currentQuestion].correctIndex) {
                       btnClass += "bg-green-500/10 border-green-500 text-green-200";
                     } else if (idx === selectedOption) {
                       btnClass += "bg-red-500/10 border-red-500 text-red-200";
                     } else {
                       btnClass += "bg-black/20 border-white/5 text-slate-600 opacity-50";
                     }
                   } else {
                     btnClass += "bg-black/40 border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20 hover:text-white";
                   }

                   return (
                     <button
                       key={idx}
                       onClick={() => handleOptionClick(idx)}
                       disabled={showResult}
                       className={btnClass}
                     >
                       <div className="flex items-center relative z-10">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-sm font-bold transition-colors ${
                            showResult && idx === SAMPLE_QUIZ[currentQuestion].correctIndex 
                            ? 'bg-green-500 text-white' 
                            : showResult && idx === selectedOption
                            ? 'bg-red-500 text-white'
                            : 'bg-white/5 text-slate-400'
                         }`}>
                           {showResult && idx === SAMPLE_QUIZ[currentQuestion].correctIndex ? <Check className="w-4 h-4"/> : String.fromCharCode(65 + idx)}
                         </div>
                         <span className="font-medium text-lg">{option}</span>
                       </div>
                     </button>
                   );
                 })}
               </div>

               {showResult && (
                 <div className="mt-8 p-6 rounded-2xl bg-black/60 border border-white/10 animate-fade-in shadow-2xl">
                   <div className="flex items-start space-x-4">
                     <div className="bg-primary-500/20 p-3 rounded-full">
                       <Award className="w-6 h-6 text-primary-400" />
                     </div>
                     <div>
                       <h5 className="text-white font-bold text-lg mb-2">Expert Breakdown</h5>
                       <p className="text-slate-300 leading-relaxed">{SAMPLE_QUIZ[currentQuestion].explanation}</p>
                     </div>
                   </div>
                   <div className="mt-6 flex justify-end">
                     <button 
                       onClick={nextQuestion}
                       className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center shadow-lg shadow-white/10"
                     >
                       {currentQuestion < SAMPLE_QUIZ.length - 1 ? 'Next Challenge' : 'Finish Quiz'} <ChevronRight className="w-4 h-4 ml-1" />
                     </button>
                   </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
