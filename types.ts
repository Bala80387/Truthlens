export type View = 'dashboard' | 'analyzer' | 'education' | 'settings' | 'history' | 'shield';

export type Classification = 'Real' | 'Fake' | 'Misleading' | 'Satire' | 'Unverified';

export interface AnalysisResult {
  classification: Classification;
  confidence: number;
  summary: string;
  reasoning: string[];
  factChecks: Array<{ claim: string; verdict: string; source: string }>;
  emotionalTriggers: string[];
  viralityScore: number; // 0-100
  isAiGenerated: boolean;
  timestamp?: number;
}

export interface HistoryItem extends AnalysisResult {
  id: string;
  preview: string;
  type: 'text' | 'image' | 'url';
}

export interface NewsItem {
  id: string;
  title: string;
  category: 'Politics' | 'Health' | 'Finance' | 'Crime' | 'Tech';
  timestamp: string;
  virality: number;
  status: Classification;
}

export interface QuizQuestion {
  id: number;
  scenario: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface EducationModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  questions: QuizQuestion[];
}

export interface UserSettings {
  sensitivity: 'low' | 'medium' | 'high';
  autoDetectLanguage: boolean;
  notifications: boolean;
  theme: 'dark' | 'light'; // kept for future use
}