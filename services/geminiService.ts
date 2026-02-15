import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult, Classification, ViralSource, InvestigationResult } from "../types";

// Helper to sanitize JSON string from Markdown code blocks
const cleanJsonString = (str: string): string => {
  return str.replace(/```json\n?|\n?```/g, "").trim();
};

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API Key not found");
}
const ai = new GoogleGenAI({ apiKey });

export const generateTTS = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  try {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: { parts: [{ text }] },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName } }
            }
        }
     });
     return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
  } catch (e) {
      console.error("TTS Generation Error:", e);
      return '';
  }
};

export const runAutonomousInvestigation = async (claim: string): Promise<InvestigationResult> => {
    try {
        const prompt = `
            You are an Autonomous Investigative Journalist Agent.
            Your goal is to verify the following claim using Google Search: "${claim}".

            Task:
            1. Search for corroborating or debunking evidence from reputable news sources and fact-checking organizations.
            2. Construct a timeline of events if applicable.
            3. Extract key evidence.

            Return a JSON object with this structure:
            {
                "steps": ["Step 1 description", "Step 2 description"],
                "timeline": [{"date": "YYYY-MM-DD", "event": "Event description"}],
                "verdict": "Detailed conclusion based on search results.",
                "keyEvidence": ["Evidence point 1", "Evidence point 2"]
            }
        `;

        // Using Gemini 3 Pro for complex reasoning and search capabilities
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json"
            }
        });

        const text = response.text || "{}";
        const data = JSON.parse(cleanJsonString(text));

        // Extract grounding metadata (search sources)
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => {
            if (chunk.web) {
                return {
                    title: chunk.web.title,
                    uri: chunk.web.uri,
                    source: new URL(chunk.web.uri).hostname.replace('www.', '')
                };
            }
            return null;
        }).filter(Boolean) || [];

        return {
            steps: data.steps || ["Analyzed claim syntax", "Performed heuristic check"],
            timeline: data.timeline || [],
            verdict: data.verdict || "Investigation inconclusive.",
            keyEvidence: data.keyEvidence || [],
            sources: sources
        };

    } catch (e) {
        console.error("Investigation Error:", e);
        return {
            steps: ["Agent failed to connect to knowledge graph"],
            timeline: [],
            verdict: "Autonomous investigation unavailable.",
            keyEvidence: [],
            sources: []
        };
    }
};

export const analyzeGeoThreat = async (
  region: string,
  activeCampaigns: number,
  dominantNarrative: string,
  vectors: string[]
): Promise<{ 
  riskAssessment: string; 
  strategicImplications: string[]; 
  stabilityScore: number;
  threatActors: string[];
  recentReports: Array<{ title: string; date: string }>;
}> => {
  try {
    const prompt = `
      You are a Geopolitical Misinformation Analyst.
      Analyze the following threat data for region: ${region}.
      
      Data:
      - Active Disinformation Campaigns: ${activeCampaigns}
      - Dominant Narrative: "${dominantNarrative}"
      - Inbound Attack Vectors: ${JSON.stringify(vectors)}

      Provide a JSON output with the following keys:
      1. riskAssessment: A concise situation report (max 50 words).
      2. strategicImplications: 3 bullet points on potential real-world impact (e.g., election interference, civil unrest).
      3. stabilityScore: 0-100 (100 is stable, 0 is collapsing).
      4. threatActors: List of 3 likely threat actor group names or types specific to this region/narrative (e.g., "Fancy Bear", "Hacktivists").
      5. recentReports: List of 2 fictional intelligence report titles and dates (YYYY-MM-DD) relevant to the situation.
      
      Return JSON only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(cleanJsonString(response.text || "{}"));
    return {
      riskAssessment: result.riskAssessment || "Data insufficient for assessment.",
      strategicImplications: result.strategicImplications || ["Monitor situation."],
      stabilityScore: result.stabilityScore || 50,
      threatActors: result.threatActors || ["Unknown Actors"],
      recentReports: result.recentReports || []
    };

  } catch (e) {
    console.error("Geo Analysis Error", e);
    return { 
        riskAssessment: "Service unavailable.", 
        strategicImplications: [], 
        stabilityScore: 50,
        threatActors: ["System Offline"],
        recentReports: []
    };
  }
};

export const analyzeUserRisk = async (
  handle: string,
  bio: string,
  recentPosts: string[]
): Promise<{ credibilityScore: number; botProbability: number; cluster: string }> => {
  try {
    const prompt = `
      Analyze this social media user profile for misinformation risk.
      Handle: ${handle}
      Bio: ${bio}
      Recent Posts: ${JSON.stringify(recentPosts)}

      Determine:
      1. Credibility Score (0-100): High is trusted, Low is suspicious.
      2. Bot Probability (0-100): High means likely automated.
      3. Cluster: 'Botnet', 'Political', 'Organic', or 'State-Sponsored'.
      
      Return JSON only: { "credibilityScore": number, "botProbability": number, "cluster": string }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(cleanJsonString(response.text || "{}"));
    return {
      credibilityScore: result.credibilityScore || 50,
      botProbability: result.botProbability || 50,
      cluster: result.cluster || 'Organic'
    };
  } catch (e) {
    console.error("User Profiling Error", e);
    return { credibilityScore: 50, botProbability: 0, cluster: 'Organic' };
  }
};

export const analyzeContent = async (
  content: string,
  type: 'text' | 'image' | 'url' | 'video' | 'audio',
  imageBase64?: string
): Promise<AnalysisResult> => {

  // System instruction for Explainable AI (XAI) and Evidence-Based Verification
  const systemInstruction = `
    You are TruthLens, a state-of-the-art cognitive security engine designed for evidence-based verification, deepfake detection, and AI-Text/Voice differentiation.
    
    CORE DIRECTIVES:
    1. AI CONTENT DETECTION (Text):
       - Analyze "Perplexity" (unpredictability of text). Low perplexity = AI. High perplexity = Human.
       - Analyze "Burstiness" (variation in sentence structure). Low burstiness = AI. High burstiness = Human.
    2. AI VOICE DETECTION (Audio):
       - Listen for "Synthetic Prosody" (unnatural evenness in pitch/tone).
       - Detect "Breath Masking" (lack of natural breath pauses).
       - Identify "Digital Artifacts" (metallic undertones in high frequencies).
    3. EVIDENCE-BASED: Cite specific evidence or logical inconsistencies.
    4. EXPLAINABLE AI: Use a "Chain of Thought" approach. Premise -> Feature Extraction -> Conclusion.
    5. KNOWLEDGE GRAPH: Extract entities and relationships to build a graph representation of the claim.

    CLASSIFICATION RULES:
    - Real: Corroborated by reliable sources / Organic human content.
    - Fake: Proven false / Synthetic content posing as real.
    - Misleading: True facts in false context.
    - Satire: Humorous intent.
    - Unverified: Insufficient evidence.
  `;

  // Schema for structured output
  const schema = {
    type: Type.OBJECT,
    properties: {
      classification: { type: Type.STRING, enum: ['Real', 'Fake', 'Misleading', 'Satire', 'Unverified'] },
      confidence: { type: Type.INTEGER, description: "Confidence score between 0 and 100" },
      summary: { type: Type.STRING },
      reasoning: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Step-by-step logic chain explaining the verdict."
      },
      factChecks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            claim: { type: Type.STRING },
            verdict: { type: Type.STRING },
            source: { type: Type.STRING, description: "Specific organization, report, or logical axiom used as evidence." }
          }
        }
      },
      emotionalTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
      viralityScore: { type: Type.INTEGER, description: "Predicted virality score 0-100" },
      isAiGenerated: { type: Type.BOOLEAN },
      technicalMetrics: {
        type: Type.OBJECT,
        properties: {
            bertLinguisticScore: { type: Type.INTEGER, description: "0-100 Semantic coherence" },
            lstmTemporalConsistency: { type: Type.INTEGER, description: "0-100 Narrative logic" },
            vitVisualArtifacts: { type: Type.INTEGER, description: "0-100 Deepfake probability" },
            aiProbability: { type: Type.INTEGER, description: "0-100 Probability content is AI generated" },
            perplexityScore: { type: Type.INTEGER, description: "0-100 Text complexity (Low = AI)" },
            burstinessScore: { type: Type.INTEGER, description: "0-100 Sentence variation (Low = AI)" }
        }
      },
      knowledgeGraph: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['Person', 'Organization', 'Location', 'Event', 'Concept', 'Claim'] },
                riskScore: { type: Type.INTEGER, description: "0-100 Risk level of entity" }
              }
            }
          },
          links: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source: { type: Type.STRING, description: "Source node ID" },
                target: { type: Type.STRING, description: "Target node ID" },
                relation: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['supports', 'contradicts', 'originates_from', 'mentions', 'affiliated_with'] }
              }
            }
          }
        }
      }
    },
    required: ["classification", "confidence", "reasoning", "viralityScore", "technicalMetrics", "isAiGenerated", "knowledgeGraph"]
  };

  try {
    let resultJson: any;

    // --- AUDIO ANALYSIS ---
    if (type === 'audio' && imageBase64) {
        const prompt = `
            Analyze this audio file for AI Synthesis vs Human Speech.
            1. Transcribe the audio.
            2. Analyze the Audio Signal: Look for metallic artifacts, lack of breath, or perfect pitch stability (Robotic).
            3. Analyze the Text Syntax: Look for AI writing patterns (repetitive transitions, low burstiness).
            4. Extract Knowledge Graph entities.
            
            Return JSON matching the schema. 
            If it sounds robotic or the text is generic AI slop, set 'isAiGenerated' to true and 'aiProbability' > 80.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'audio/mp3', data: imageBase64 } }, 
                    { text: prompt }
                ]
            },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        const textResponse = response.text || "{}";
        resultJson = JSON.parse(textResponse);
    } 
    // --- IMAGE / VIDEO ANALYSIS ---
    else if ((type === 'image' || type === 'video') && imageBase64) {
      const prompt = `
        Perform a Deepfake Forensics Analysis on this ${type === 'video' ? 'video keyframe' : 'image'}.
        1. Scan for GAN/Diffusion artifacts: warped backgrounds, asymmetrical facial features (eyes, ears), unnatural skin texture.
        2. Analyze lighting consistency.
        3. Extract any text and verify claims.
        4. Build a Knowledge Graph of identified people, objects, and text entities.
        
        Return a JSON object matching the schema. 
        In 'reasoning', list specific visual artifacts found.
        Set 'isAiGenerated' to true if artifacts are significant.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
            { text: content ? `Context provided: ${content}. ${prompt}` : prompt }
          ]
        },
        config: {
          systemInstruction: systemInstruction, 
        }
      });

      const textResponse = response.text || "{}";
      const jsonStr = cleanJsonString(textResponse);
      try {
        resultJson = JSON.parse(jsonStr);
      } catch (e) {
        // Fallback for non-strict JSON models (flash-image can be chatty)
        resultJson = {
          classification: "Unverified",
          confidence: 0,
          summary: "Raw analysis: " + textResponse.substring(0, 200) + "...",
          reasoning: ["Could not parse structured forensic data."],
          viralityScore: 0,
          isAiGenerated: false,
          technicalMetrics: { bertLinguisticScore: 50, lstmTemporalConsistency: 50, vitVisualArtifacts: 50, aiProbability: 50 },
          knowledgeGraph: { nodes: [], links: [] }
        }
      }

    } 
    // --- TEXT / URL ANALYSIS ---
    else {
      let promptText = content;
      
      if (type === 'url') {
        promptText = `
          Analyze this URL: "${content}". 
          1. Domain Credibility & Typosquatting.
          2. Content Analysis: Check against verified facts.
          3. AI Detection: Estimate if the content on this page is AI-generated.
          4. Knowledge Graph: Map key entities and claims.
          Return result in JSON.
        `;
      } else {
        promptText = `
          Analyze this text: "${content}".
          1. AI DETECTION: Calculate Perplexity and Burstiness. 
             - If sentences are uniform length and use common transition words ("Furthermore", "In conclusion"), flag as AI.
             - If text has high variance and specific nuances, flag as Human.
          2. Fact-check claims.
          3. Identify logical fallacies.
          4. Knowledge Graph: Extract entities (People, Orgs, Locations) and Claims. Link them based on relationships found in text.
          Return result in JSON.
        `;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: promptText,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      const textResponse = response.text || "{}";
      resultJson = JSON.parse(textResponse);
    }

    return {
      classification: (resultJson.classification as Classification) || 'Unverified',
      confidence: resultJson.confidence || 0,
      summary: resultJson.summary || "No summary available.",
      reasoning: resultJson.reasoning || [],
      factChecks: resultJson.factChecks || [],
      emotionalTriggers: resultJson.emotionalTriggers || [],
      viralityScore: resultJson.viralityScore || 0,
      isAiGenerated: resultJson.isAiGenerated || false,
      timestamp: Date.now(),
      technicalMetrics: resultJson.technicalMetrics || { 
          bertLinguisticScore: 0, 
          lstmTemporalConsistency: 0, 
          vitVisualArtifacts: 0, 
          aiProbability: 0,
          perplexityScore: 0,
          burstinessScore: 0
      },
      knowledgeGraph: resultJson.knowledgeGraph || { nodes: [], links: [] }
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      classification: 'Unverified',
      confidence: 0,
      summary: "An error occurred while analyzing the content. Please try again.",
      reasoning: ["Analysis service unavailable."],
      factChecks: [],
      emotionalTriggers: [],
      viralityScore: 0,
      isAiGenerated: false,
      timestamp: Date.now(),
      technicalMetrics: { bertLinguisticScore: 0, lstmTemporalConsistency: 0, vitVisualArtifacts: 0, aiProbability: 0 },
      knowledgeGraph: { nodes: [], links: [] }
    };
  }
};

export const translateText = async (text: string, language: string): Promise<string> => {
  try {
    const prompt = `
      Translate the following analysis summary into ${language}. 
      Keep technical terms (like 'AI', 'Deepfake', 'TruthLens') in English if they are commonly used, or use appropriate localized technical terms.
      Return ONLY the translated text. Do not add markdown or conversational filler.
      
      Text to translate:
      "${text}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (e) {
    console.error("Translation Error:", e);
    return text;
  }
};