
import { GoogleGenAI } from "@google/genai";

export async function processImageEditing(
  base64Image: string,
  prompt: string,
  maskBase64?: string | null
): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found.");

  const ai = new GoogleGenAI({ apiKey });
  
  const extractData = (base64: string) => ({
    data: base64.split(',')[1],
    mimeType: base64.split(',')[0].split(':')[1].split(';')[0]
  });

  const mainImage = extractData(base64Image);
  const parts: any[] = [
    { inlineData: mainImage }
  ];

  if (maskBase64) {
    const maskImage = extractData(maskBase64);
    parts.push({ inlineData: maskImage });
    parts.push({ text: `The first image is the original. The second image is a mask where white is the selection. Instruction: ${prompt}. Only modify the area indicated by the white mask. Make it look natural.` });
  } else {
    parts.push({ text: `Instruction: ${prompt}. Automatically detect the subject and apply changes naturally.` });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
    });

    if (!response.candidates?.[0]) throw new Error("AI failed to generate a response.");
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image data returned from AI.");
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
