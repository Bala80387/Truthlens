export type View = 'dashboard' | 'analyzer' | 'tracker' | 'geo' | 'education' | 'settings' | 'history' | 'shield' | 'news' | 'mail';

export type Classification = 'Real' | 'Fake' | 'Misleading' | 'Satire' | 'Unverified';

export interface TechnicalMetrics {
  bertLinguisticScore: number;
  lstmTemporalConsistency: number;
  vitVisualArtifacts: number;
  aiProbability: number;
  perplexityScore?: number;
  burstinessScore?: number;
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

export interface GraphNode {
  id: string;
  label: string;
  type: 'Person' | 'Organization' | 'Location' | 'Event' | 'Concept' | 'Claim';
  riskScore: number; // 0-100
  group?: number;
  // Simulation props
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  relation: string;
  type: 'supports' | 'contradicts' | 'originates_from' | 'mentions' | 'affiliated_with';
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ClaimVerification {
  claim: string;
  status: 'Supported' | 'Contradicted' | 'Not Verified';
  confidence: number;
  evidence: string[];
  sources: string[];
}

export interface MultimodalFusion {
  textImageConsistency: number; // 0-100
  captionMatch: boolean;
  manipulationDetected: boolean;
  fusionScore: number; // Combined authenticity score
}

export interface AnalysisResult {
  classification: Classification;
  confidence: number;
  summary: string;
  reasoning: string[];
  factChecks: ClaimVerification[]; // Enhanced from simple object
  emotionalTriggers: string[];
  viralityScore: number;
  isAiGenerated: boolean;
  timestamp?: number;
  technicalMetrics?: TechnicalMetrics;
  investigation?: InvestigationResult;
  knowledgeGraph?: KnowledgeGraph;
  domain?: 'General' | 'Politics' | 'Health' | 'Finance';
  multimodal?: MultimodalFusion; // New field
  influentialWords?: string[]; // For Explainable AI
}

export interface HistoryItem extends AnalysisResult {
  id: string;
  preview: string;
  type: 'text' | 'image' | 'url' | 'video' | 'audio';
}

export interface UserSettings {
  sensitivity: 'low' | 'medium' | 'high';
  autoDetectLanguage: boolean;
  notifications: boolean;
  theme: 'dark' | 'light';
}

export interface QuizQuestion {
  id: number;
  scenario: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ViralTrend {
  id: string;
  topic: string;
  volume: number;
  velocity: number;
  status: 'Active' | 'Critical' | 'Contained';
  sourceUser: ViralSource;
  timestamp: number;
  region: string;
}

export interface ViralSource {
  id: string;
  handle: string;
  avatar: string;
  platform: string;
  accountAge: string;
  followers: number;
  credibilityScore: number;
  botProbability: number;
  location: string;
  networkCluster: 'Botnet' | 'State-Sponsored' | 'Organic' | 'Political';
  recentFlags: number;
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
  type: 'Botnet' | 'State-Sponsored' | 'Organic';
}

export interface NewsItem {
    id: string;
    title: string;
    source: string;
    category: 'Politics' | 'Health' | 'Finance' | 'Tech' | 'Global' | 'Cyber';
    timestamp: number;
    virality: number;
    status: Classification;
    snippet: string;
    author: string;
}

export interface InboxItem {
  id: string;
  platform: 'Gmail' | 'Outlook' | 'Twitter' | 'LinkedIn' | 'Instagram' | 'WhatsApp';
  sender: string;
  senderHandle?: string;
  subject?: string; // Optional for DMs
  snippet: string;
  body: string;
  timestamp: number;
  isRead: boolean;
  tags: string[];
  riskLevel: 'Safe' | 'Suspicious' | 'Malicious';
  attachments?: Array<{ name: string; type: string; size: string }>;
}