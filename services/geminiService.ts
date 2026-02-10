import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult, Classification } from "../types";

// Helper to sanitize JSON string from Markdown code blocks
const cleanJsonString = (str: string): string => {
  return str.replace(/```json\n?|\n?```/g, "").trim();
};

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API Key not found");
}
const ai = new GoogleGenAI({ apiKey });

export const analyzeContent = async (
  content: string,
  type: 'text' | 'image' | 'url',
  imageBase64?: string
): Promise<AnalysisResult> => {

  // System instruction for Explainable AI (XAI) and Evidence-Based Verification
  const systemInstruction = `
    You are TruthLens, a state-of-the-art cognitive security engine designed for evidence-based verification and deepfake detection.
    
    CORE DIRECTIVES:
    1. EVIDENCE-BASED: Do not just state a verdict. Cite specific evidence, logical inconsistencies, or known verified facts.
    2. EXPLAINABLE AI: Use a "Chain of Thought" approach. Break down the logic: Premise -> Inconsistency -> Conclusion.
    3. MULTIMODAL FORENSICS: When analyzing images, look for specific deepfake artifacts (asymmetrical eyes, weird hands, lighting mismatches, pixelation boundaries).
    4. UNBIASED: Maintain strictly neutral, objective tone.

    CLASSIFICATION RULES:
    - Real: Corroborated by multiple reliable sources.
    - Fake: Proven false by evidence or physically impossible.
    - Misleading: True facts used in false context or manipulated data.
    - Satire: Humorous intent, clearly not meant to be factual.
    - Unverified: Insufficient evidence to prove or disprove.
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
      isAiGenerated: { type: Type.BOOLEAN }
    },
    required: ["classification", "confidence", "reasoning", "viralityScore"]
  };

  try {
    let resultJson: any;

    if (type === 'image' && imageBase64) {
      // Specialized Deepfake Detection Prompt
      const prompt = `
        Perform a Deepfake Forensics Analysis on this image.
        1. Scan for GAN/Diffusion artifacts: warped backgrounds, asymmetrical facial features (eyes, ears), unnatural skin texture (too smooth/too sharp), and hand structure.
        2. Analyze lighting consistency: Do shadows match light sources?
        3. Extract any text and verify claims.
        
        Return a JSON object matching the schema. 
        In 'reasoning', list specific visual artifacts found (e.g., 'Inconsistent shadow angle on subject's neck').
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
          // Note: Response schema not fully supported in vision models in all regions yet, parsing text is safer, 
          // but we can try to guide it strongly.
        }
      });

      const textResponse = response.text || "{}";
      // Vision models might return markdown code blocks
      const jsonStr = cleanJsonString(textResponse);
      try {
        resultJson = JSON.parse(jsonStr);
      } catch (e) {
        // Fallback for malformed JSON from vision model
        console.warn("Malformed JSON from vision model, attempting repair", textResponse);
        resultJson = {
          classification: "Unverified",
          confidence: 0,
          summary: "Raw analysis: " + textResponse.substring(0, 200) + "...",
          reasoning: ["Could not parse structured forensic data."],
          viralityScore: 0,
          isAiGenerated: false
        }
      }

    } else {
      // Text/URL Verification
      let promptText = content;
      
      if (type === 'url') {
        promptText = `
          Analyze this URL: "${content}". 
          1. Domain Credibility: Check if the domain mimics a legitimate site (typosquatting).
          2. Content Analysis: Infer likely content and check against known misinformation narratives.
          3. Fast Checking: Cross-reference with known fact-checks.
          Return result in JSON.
        `;
      } else {
        promptText = `
          Analyze this text: "${content}".
          1. Cross-reference claims with your internal knowledge base of verified facts.
          2. Identify logical fallacies (strawman, ad hominem, slippery slope).
          3. Detect emotional manipulation patterns.
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

export const generateAudioReport = async (
  summary: string,
  classification: string,
  language: string,
  gender: 'male' | 'female'
): Promise<string | undefined> => {
  try {
    const voiceName = gender === 'female' ? 'Kore' : 'Fenrir';
    const prompt = `
      Act as a professional news anchor. 
      Translate the following verification report summary into ${language} and speak it clearly and fluently.
      Verification Status: ${classification}.
      Summary: ${summary}.
      Start by stating the status clearly in ${language}.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (e) {
    console.error("TTS Error:", e);
    throw e;
  }
};
