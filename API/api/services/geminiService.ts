// services/geminiService.ts
// Client-side shim: sends image + lang to the serverless endpoint /api/analyze
import { AnalysisResult, LanguageCode } from "../types";

export const analyzeFace = async (base64Image: string, lang: LanguageCode): Promise<AnalysisResult> => {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, lang })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Analysis failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data as AnalysisResult;
};
