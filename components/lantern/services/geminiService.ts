import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not set in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateWeddingWish = async (relationship: string, tone: string = "heartfelt"): Promise<string> => {
  const client = getClient();
  if (!client) {
    // Fallback if no API key is present
    return "May your life together be filled with love and laughter. (API Key missing for AI generation)";
  }

  try {
    const prompt = `Write a short, ${tone} wedding wish for a couple named Aman & Sneha. The sender is their ${relationship}. Keep it under 30 words so it fits on a lantern.`;
    
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Wishing you a lifetime of happiness together!";
  } catch (error) {
    console.error("Error generating wish:", error);
    return "Wishing you a lifetime of love and joy!";
  }
};
