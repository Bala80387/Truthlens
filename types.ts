export type View = 'dashboard' | 'analyzer' | 'tracker' | 'geo' | 'education' | 'settings' | 'history' | 'shield';

export type Classification = 'Real' | 'Fake' | 'Misleading' | 'Satire' | 'Unverified';

export interface TechnicalMetrics {
  bertLinguisticScore: number; // 0-100, measures semantic coherence
  lstmTemporalConsistency: number; // 0-100, measures narrative timeline logic
  vitVisualArtifacts: number; // 0-100, measures probability of deepfake artifacts
  aiProbability: number; // 0-100, Probability text/audio is AI generated
  perplexityScore?: number; // 0-100, Low = AI, High = Human
  burstinessScore?: number; // 0-100, Low = AI, High = Human
}

export interface WebSource {
  title: string;
  uri: string;
  source: string;
}

export interface InvestigationResult {
  steps: string[];
  sources: WebSource[];
  timeline: Array<{ date: string; event: string }>;
  verdict: string;
  keyEvidence: string[];
}

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
  technicalMetrics?: TechnicalMetrics;
  investigation?: InvestigationResult; // New field for deep agent report
}

export interface ViralSource {
  id: string;
  handle: string;
  avatar: string;
  platform: 'Twitter' | 'Facebook' | 'Telegram' | 'TikTok' | 'Reddit';
  accountAge: string;
  followers: number;
  credibilityScore: number; // 0-100 (100 is trusted)
  botProbability: number; // 0-100
  location: string;
  networkCluster: 'Botnet' | 'Political' | 'Organic' | 'State-Sponsored';
  recentFlags: number;
}

export interface ViralTrend {
  id: string;
  topic: string;
  volume: number; // mentions per minute
  velocity: number; // % growth
  status: 'Active' | 'Contained' | 'Critical';
  sourceUser: ViralSource;
  timestamp: number;
  region: string;
}

export interface HistoryItem extends AnalysisResult {
  id: string;
  preview: string;
  type: 'text' | 'image' | 'url' | 'video' | 'audio';
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

export interface GeoRegion {
  id: string;
  name: string;
  threatLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  activeCampaigns: number;
  dominantNarrative: string;
  coordinates: { x: number; y: number };
}

export interface AttackVector {
  id: string;
  sourceRegionId: string;
  targetRegionId: string;
  volume: number;
  type: 'Botnet' | 'Organic' | 'State-Sponsored';
}