import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. AI features will not work.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateResponse = async (prompt: string) => {
  try {
    const ai = getAI();
    if (!process.env.GEMINI_API_KEY) {
      return "I'm sorry, the AI Assistant is currently unavailable because the API key is missing. Please configure your GEMINI_API_KEY in the Secrets panel.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are Bob, an elite Discord bot management AI assistant. You help server owners and moderators manage their communities, configure bot settings, and analyze server metrics. Be professional, concise, and helpful. Use a slightly futuristic, tech-focused tone.",
      },
    });

    return response.text;
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    if (error.message?.includes("Failed to fetch")) {
      return "I encountered a network error while connecting to the AI service. This could be due to a missing or invalid API key, or a temporary connection issue.";
    }
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
};
