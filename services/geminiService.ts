
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { 
  LanguageVariant, 
  WritingStyle, 
  OperationMode, 
  OperationType, 
  ProcessingResult,
  ReferenceCitationStyle
} from "../types";

const SYSTEM_PROMPT = `
You are IdiomaSwitch, a professional Level-5 AI language assistant.
Key Governance Rules:
- No Hallucination: If unknown, state "Insufficient information".
- Confidence Management: Assign GREEN (High), YELLOW (Medium), or RED (Low).
- REFUSE if Português BR is detected in input or requested for output.
- Tone: Neutral, calm, precise, professional.
- Style: Strictly respect requested Writing Style.

Specific processing logic:
1. Parse input intent and variant.
2. Enforce source -> target variant compliance.
3. Apply requested Operations. If multiple are selected, combine them intelligently (e.g., correct then rewrite).
4. If ENRICH is selected, find relevant references using Google Search.
5. Reference Formatting: Format citations according to requested Citation Style.
6. Apply Humanisation Engine (micro-syntactic variations, rhythm adjustments).
7. Perform AI-trace evaluation (simulate ZeroGPT logic) and return aiTracePercentage (0-100).
8. Return the final result as a structured JSON object.
`;

export async function* processTextStream(
  input: string,
  url: string,
  images: string[],
  sourceVariant: LanguageVariant,
  targetVariant: LanguageVariant,
  style: WritingStyle,
  mode: OperationMode,
  operations: OperationType[],
  citStyle: ReferenceCitationStyle
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const parts: any[] = [
    { text: `
      Operations Requested: ${operations.join(', ')}
      Source Language: ${sourceVariant}
      Target Language: ${targetVariant}
      Writing Style: ${style}
      Mode: ${mode}
      Reference Citation Format: ${citStyle}
      ${url ? `Reference Link: ${url}` : ''}
      
      Input Text:
      ${input}
      
      IMPORTANT: Respond ONLY with the JSON object following the schema.
    `}
  ];

  images.forEach(img => {
    parts.push({
      inlineData: {
        data: img.split(',')[1],
        mimeType: 'image/jpeg'
      }
    });
  });

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3-pro-preview",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          confidence: { type: Type.STRING },
          auditTrace: {
            type: Type.OBJECT,
            properties: {
              intentConfidence: { type: Type.STRING },
              constraintSatisfaction: { type: Type.STRING },
              humanisationApplied: { type: Type.STRING },
              aiTraceRisk: { type: Type.STRING },
              aiTracePercentage: { type: Type.NUMBER },
              variantCompliance: { type: Type.STRING },
              references: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          error: { type: Type.STRING }
        },
        required: ["text", "confidence", "auditTrace"]
      }
    }
  });

  for await (const chunk of responseStream) {
    yield chunk;
  }
}
