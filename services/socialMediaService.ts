import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Fallbacks in case of API limits or offline
const FALLBACK_TOPICS = [
  "Quantum encryption leak at NSA",
  "Mars colony critical failure",
  "Central bank digital currency mandated",
  "AI rights bill passes senate",
  "Oceanic anomaly detected in Pacific",
  "Global internet outage imminent",
  "New virus strain defies containment"
];

export interface SocialPost {
  id: string;
  author: string;
  handle: string;
  avatarColor?: string;
  content: string;
  platform: 'Twitter' | 'X' | 'Reddit' | 'Telegram';
  likes: number;
  retweets: number;
  timeAgo: string;
  isBot: boolean;
  sentiment: 'fear' | 'anger' | 'neutral' | 'skepticism';
}

export const fetchTrendingTopics = async (): Promise<string[]> => {
  if (!ai) return FALLBACK_TOPICS;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate 5 short, catchy, controversial, fictional trending news topics (max 6 words each) that sound like viral misinformation or breaking news. Return ONLY a JSON array of strings.",
      config: { responseMimeType: "application/json" }
    });
    const json = JSON.parse(response.text || "[]");
    return Array.isArray(json) && json.length > 0 ? json : FALLBACK_TOPICS;
  } catch (e) {
    console.error("Failed to fetch trends", e);
    return FALLBACK_TOPICS;
  }
};

export const fetchRelatedPosts = async (topic: string): Promise<SocialPost[]> => {
  if (!ai) return [];

  const prompt = `
    Generate 5 realistic social media posts (tweets) about the topic: "${topic}".
    
    Roles to simulate:
    1. A panicked local citizen.
    2. A conspiracy theory bot (using hashtags).
    3. An official-sounding but fake news outlet.
    4. A skeptic asking for sources.
    5. A viral aggregator account.

    Return a JSON array with this structure:
    [
      {
        "author": "Display Name",
        "handle": "@handle",
        "content": "Tweet text with hashtags",
        "platform": "Twitter",
        "likes": 120,
        "retweets": 45,
        "timeAgo": "2m",
        "isBot": true,
        "sentiment": "fear"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const posts = JSON.parse(response.text || "[]");
    return posts.map((p: any) => ({
        ...p,
        id: Math.random().toString(36).substr(2, 9),
        avatarColor: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'][Math.floor(Math.random() * 5)]
    }));
  } catch (e) {
    console.error("Failed to fetch posts", e);
    return [];
  }
};
