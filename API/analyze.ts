// api/analyze.ts
// Serverless endpoint (Vercel/Netlify compatible) — calls Gemini on server-side using GEMINI_API_KEY env var.
// Receives { image: string (base64), lang?: 'tr'|'en'|'de' } in POST body and returns JSON analysis.
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Server misconfigured: GEMINI_API_KEY missing" });
      return;
    }

    const { image, lang } = req.body || {};

    if (!image) {
      res.status(400).json({ error: "Missing 'image' in request body" });
      return;
    }

    // Clean base64 if it contains "data:image/..." prefix
    const cleanBase64 = (image as string).replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const ai = new GoogleGenAI({ apiKey });

    const getSystemInstruction = (l: string) => {
      const instructions: Record<string, string> = {
        en: "You are Shenay Ileri, a world-famous makeup artist. Analyze the user's face image carefully. Provide a short 2-sentence summary (free preview) and then detailed advice (paid). Identify face shape, skin tone, and undertone. Provide sophisticated, elegant makeup advice.",
        tr: "Sen dünyaca ünlü makyaj sanatçısı Shenay İleri'sin. Kullanıcının yüz fotoğrafını dikkatlice analiz et. Kısa 2 cümlelik bir özet (ücretsiz önizleme) ve ardından detaylı tavsiyeler (ücretli) ver. Yüz şeklini, cilt tonunu ve alt tonunu belirle. Sofistike, zarif makyaj tavsiyeleri ver.",
        de: "Sie sind Shenay Ileri, eine weltberühmte Visagistin. Analysieren Sie das Gesicht des Benutzers sorgfältig. Geben Sie eine kurze Zusammenfassung (2 Sätze) und dann detaillierte Ratschläge. Identifizieren Sie die Gesichtsform, den Hautton und den Unterton."
      };
      return instructions[(l || "tr")] || instructions["en"];
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: `Analyze this face. Return JSON only.`
          }
        ]
      },
      config: {
        systemInstruction: getSystemInstruction(lang || "tr"),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            faceShape: { type: Type.STRING },
            skinTone: { type: Type.STRING },
            features: {
              type: Type.OBJECT,
              properties: {
                eyes: { type: Type.STRING },
                face: { type: Type.STRING },
                lips: { type: Type.STRING }
              }
            },
            products: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      res.status(502).json({ error: "No response from AI provider" });
      return;
    }

    const parsed = JSON.parse(text);
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(parsed);
  } catch (err: any) {
    console.error("Server analyze error:", err);
    res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
}
