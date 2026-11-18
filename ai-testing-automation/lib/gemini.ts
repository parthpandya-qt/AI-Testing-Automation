import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "placeholder-key",
});

// Candidate models in preference order.
// gemini-2.5-flash is stable, fast, and currently responsive.
// gemini-2.5-flash-lite and gemini-3-flash-preview serve as automatic failovers if primary experiences demand spikes (503).
export const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
];

export async function generateContentWithFallback({
  contents,
  config,
  preferredModel,
}: {
  contents: any;
  config?: any;
  preferredModel?: string;
}) {
  const modelQueue = preferredModel
    ? [preferredModel, ...FALLBACK_MODELS.filter((m) => m !== preferredModel)]
    : FALLBACK_MODELS;

  let lastError: any = null;

  for (const model of modelQueue) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });

      return { response, modelUsed: model };
    } catch (err: any) {
      console.warn(`[Gemini API] Model ${model} failed: ${err.message || err}. Trying next fallback model...`);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini fallback models failed.");
}

