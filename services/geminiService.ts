
import { GoogleGenAI } from "@google/genai";

export async function processImageEditing(
  base64Image: string,
  prompt: string,
  maskBase64?: string | null,
  referenceImageBase64?: string | null
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

  let instruction = `Instruction: ${prompt}. `;

  if (maskBase64) {
    const maskImage = extractData(maskBase64);
    parts.push({ inlineData: maskImage });
    instruction += `The second image is a mask. Only modify the area indicated by white. `;
  } else {
    instruction += `Automatically detect the main subject and apply changes naturally. `;
  }

  if (referenceImageBase64) {
    const refImage = extractData(referenceImageBase64);
    parts.push({ inlineData: refImage });
    instruction += `Ensure the result matches the style and details from the provided reference image. `;
  }

  parts.push({ text: instruction + " Maintain photorealism and natural integration." });

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
