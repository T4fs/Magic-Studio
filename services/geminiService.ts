
import { GoogleGenAI } from "@google/genai";

export async function processImageEditing(
  base64Image: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found.");

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = base64Image.split(',')[1];
  const mimeType = base64Image.split(',')[0].split(':')[1].split(';')[0];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: `Instruction: ${prompt}. Please transform the highlighted subject in this image naturally.` }
        ],
      },
    });

    if (!response.candidates?.[0]) throw new Error("No AI response.");
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image data returned.");
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
