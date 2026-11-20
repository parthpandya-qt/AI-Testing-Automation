import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "placeholder-key",
});

// Candidate Gemini models in preference order.
export const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
];

// Candidate Groq models in preference order when Gemini is unavailable.
export const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
];

async function callGroqFallback({
  contents,
  config,
}: {
  contents: any;
  config?: any;
}) {
  const apiKey = process.env.GROQ_API_KEY || process.env.GROCK_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in environment variables.");
  }

  const promptText = typeof contents === "string" ? contents : JSON.stringify(contents);
  const isJson = config?.responseMimeType === "application/json";

  let lastErr: any = null;

  for (const model of GROQ_MODELS) {
    try {
      const messages: any[] = [];
      if (isJson) {
        messages.push({
          role: "system",
          content:
            "You are an expert QA automation engineer and software developer. Output strictly valid JSON matching the user request. Do not wrap in markdown or backticks.",
        });
      }
      messages.push({
        role: "user",
        content: promptText,
      });

      const body: any = {
        model,
        messages,
        temperature: config?.temperature ?? 0.2,
      };

      if (isJson) {
        body.response_format = { type: "json_object" };
      }

      if (config?.maxOutputTokens) {
        body.max_tokens = Math.min(config.maxOutputTokens, 4096);
      }

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Groq API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const outputText = data.choices?.[0]?.message?.content || "";

      return {
        response: { text: outputText },
        modelUsed: `groq/${model}`,
      };
    } catch (err: any) {
      console.warn(`[Groq API] Model ${model} failed: ${err.message || err}. Trying next Groq model...`);
      lastErr = err;
    }
  }

  throw lastErr || new Error("All Groq fallback models failed.");
}

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

  // Step 1: Try Gemini models in sequence
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

  // Step 2: Fall back to Groq models if all Gemini models fail
  console.warn("[AI Gateway] All Gemini models failed or unavailable. Activating Groq fallback...");
  try {
    const groqResult = await callGroqFallback({ contents, config });
    console.log(`[AI Gateway] Successfully processed request via Groq fallback: ${groqResult.modelUsed}`);
    return groqResult;
  } catch (groqErr: any) {
    console.error("[Groq API] Groq fallback failed:", groqErr.message || groqErr);
    throw lastError || groqErr;
  }
}
