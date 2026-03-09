
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { View, AnalysisResult, HistoryItem } from './types';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Analyzer } from './components/Analyzer';
import { Education } from './components/Education';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { SocialShield } from './components/SocialShield';
import { ViralTracker } from './components/ViralTracker';
import { GeoAnalysis } from './components/GeoAnalysis';
import { RealTimeNews } from './components/RealTimeNews';
import { ChatAssistant } from './components/ChatAssistant';
import { MailScanner } from './components/MailScanner';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { useAuth } from './components/AuthContext';
import { db } from './firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc, getDocs } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, user: any) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.uid,
      email: user?.email,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('analyzer');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [quickScanText, setQuickScanText] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const q = query(
      collection(db, 'history'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData: HistoryItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        historyData.push({
          id: doc.id,
          ...JSON.parse(data.result),
          preview: data.content.length > 60 ? data.content.substring(0, 60) + '...' : data.content,
          type: data.type,
          timestamp: data.createdAt?.toMillis() || Date.now()
        });
      });
      // Sort client-side since we don't have a composite index yet
      historyData.sort((a, b) => b.timestamp - a.timestamp);
      setHistory(historyData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'history', user);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAnalysisComplete = async (result: AnalysisResult, content: string, type: 'text' | 'image' | 'url' | 'video' | 'audio') => {
    const newItem: HistoryItem = {
      ...result,
      id: Math.random().toString(36).substr(2, 9),
      preview: type === 'image' ? 'Image Analysis' : content.length > 60 ? content.substring(0, 60) + '...' : content,
      type,
      timestamp: Date.now()
    };
    
    if (user) {
      try {
        await addDoc(collection(db, 'history'), {
          userId: user.uid,
          type: type === 'video' || type === 'audio' ? 'url' : type, // map to allowed enum
          content: type === 'image' ? 'Image Analysis' : content,
          result: JSON.stringify(result),
          createdAt: new Date()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'history', user);
      }
    } else {
      setHistory(prev => [newItem, ...prev]);
    }
  };

  const handleClearHistory = async () => {
    if (user) {
      try {
        const q = query(collection(db, 'history'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (docSnapshot) => {
          await deleteDoc(docSnapshot.ref);
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'history', user);
      }
    } else {
      setHistory([]);
    }
  };

  const handleQuickScan = (text: string) => {
    setQuickScanText(text);
    setCurrentView('analyzer');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onAnalyzeTopic={handleQuickScan} />;
      case 'news':
        return <RealTimeNews />;
      case 'mail':
        return <MailScanner />;
      case 'tracker':
        return <ViralTracker />;
      case 'geo':
        return <GeoAnalysis />;
      case 'analyzer':
        return <Analyzer 
          initialText={quickScanText} 
          onAnalysisComplete={handleAnalysisComplete} 
        />;
      case 'shield':
        return <SocialShield />;
      case 'history':
        return <History 
          history={history} 
          onSelectHistory={(item) => {
             alert(`Viewing logs for ID: ${item.id}. Detailed history replay coming in v2.2`);
          }} 
          onClearHistory={handleClearHistory}
        />;
      case 'education':
        return <Education />;
      case 'settings':
        return <Settings />;
      default:
        return <Analyzer onAnalysisComplete={handleAnalysisComplete} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-50 flex font-sans selection:bg-primary-500/30 selection:text-primary-200">
      <Navigation 
        currentView={currentView} 
        setView={(view) => {
          setCurrentView(view);
          if (view !== 'analyzer') setQuickScanText(''); // Reset quick scan when navigating away
        }} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto h-screen relative scroll-smooth">
        {/* Ambient Atmosphere */}
        <div className="fixed inset-0 pointer-events-none z-0">
           <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-primary-900/10 rounded-full blur-[120px] opacity-40"></div>
           <div className="absolute bottom-[-20%] left-[-20%] w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] opacity-40"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24 md:py-12 md:px-8 max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      {/* Global Chat Assistant */}
      <ChatAssistant />

      {/* Onboarding Tutorial */}
      <OnboardingTutorial />
    </div>
  );
};

export default App;