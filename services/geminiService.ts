import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Classification } from "../types";

// Helper to sanitize JSON string from Markdown code blocks
const cleanJsonString = (str: string): string => {
  return str.replace(/```json\n?|\n?```/g, "").trim();
};

export const analyzeContent = async (
  content: string,
  type: 'text' | 'image' | 'url',
  imageBase64?: string
): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  // System instruction for the persona
  const systemInstruction = `
    You are TruthLens, an advanced misinformation detection engine. 
    Your goal is to analyze content for veracity, bias, and manipulation.
    You must classify content as Real, Fake, Misleading, Satire, or Unverified.
    You must provide explainable reasoning, detect emotional manipulation, and estimate virality.
    If the content is harmless or true, verify it. If it is harmful or false, debunk it with clear logic.
  `;

  // Schema for structured output (used for text/url requests)
  const schema = {
    type: Type.OBJECT,
    properties: {
      classification: { type: Type.STRING, enum: ['Real', 'Fake', 'Misleading', 'Satire', 'Unverified'] },
      confidence: { type: Type.INTEGER, description: "Confidence score between 0 and 100" },
      summary: { type: Type.STRING },
      reasoning: { type: Type.ARRAY, items: { type: Type.STRING } },
      factChecks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            claim: { type: Type.STRING },
            verdict: { type: Type.STRING },
            source: { type: Type.STRING, description: "A likely source or 'General Knowledge'" }
          }
        }
      },
      emotionalTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
      viralityScore: { type: Type.INTEGER, description: "Predicted virality score 0-100" },
      isAiGenerated: { type: Type.BOOLEAN }
    },
    required: ["classification", "confidence", "reasoning", "viralityScore"]
  };

  try {
    let resultJson: any;

    if (type === 'image' && imageBase64) {
      // Use Gemini 2.5 Flash Image for multimodal analysis
      const prompt = `
        Analyze this image and any text within it for misinformation.
        Return a valid JSON object with the following structure:
        {
          "classification": "Real" | "Fake" | "Misleading" | "Satire" | "Unverified",
          "confidence": number (0-100),
          "summary": "string",
          "reasoning": ["string", "string"],
          "factChecks": [{"claim": "string", "verdict": "string", "source": "string"}],
          "emotionalTriggers": ["string"],
          "viralityScore": number (0-100),
          "isAiGenerated": boolean
        }
        Only return the JSON.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
            { text: content ? `Context provided: ${content}. ${prompt}` : prompt }
          ]
        }
      });

      const textResponse = response.text || "{}";
      resultJson = JSON.parse(cleanJsonString(textResponse));

    } else {
      // Use Gemini 3 Flash Preview for text and URL analysis
      let promptText = content;
      
      if (type === 'url') {
        promptText = `
          Analyze this URL: "${content}". 
          1. Assess the domain reputation and credibility history.
          2. If it is a known satire or fake news site, flag it immediately.
          3. If the URL looks like a phishing pattern (e.g. typosquatting), flag it.
          4. Analyze the likely content structure based on the URL parameters.
          Return the response in the requested JSON schema.
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

    // Map strict types to ensure UI safety
    return {
      classification: (resultJson.classification as Classification) || 'Unverified',
      confidence: resultJson.confidence || 0,
      summary: resultJson.summary || "No summary available.",
      reasoning: resultJson.reasoning || [],
      factChecks: resultJson.factChecks || [],
      emotionalTriggers: resultJson.emotionalTriggers || [],
      viralityScore: resultJson.viralityScore || 0,
      isAiGenerated: resultJson.isAiGenerated || false,
      timestamp: Date.now()
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback error result
    return {
      classification: 'Unverified',
      confidence: 0,
      summary: "An error occurred while analyzing the content. Please try again.",
      reasoning: ["Analysis service unavailable."],
      factChecks: [],
      emotionalTriggers: [],
      viralityScore: 0,
      isAiGenerated: false,
      timestamp: Date.now()
    };
  }
};