import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const _geminiModels = new Map<string, GenerativeModel>();

export function getGeminiModel(modelName: string = "gemini-3.6-flash"): GenerativeModel {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable in .env.local");
  }
  if (!_geminiModels.has(modelName)) {
    const genAI = new GoogleGenerativeAI(apiKey);
    _geminiModels.set(
      modelName,
      genAI.getGenerativeModel({ model: modelName })
    );
  }
  return _geminiModels.get(modelName)!;
}

export async function generateAIResponse(
  systemPrompt: string,
  conversationHistory: { role: string; content: string }[],
  userMessage: string
): Promise<string> {
  try {
    const model = getGeminiModel();
    const contents = [
      ...conversationHistory.map((msg) => ({
        role: msg.role === "customer" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      { role: "user", parts: [{ text: userMessage }] },
    ];

    const result = await model.generateContent({
      contents,
      systemInstruction: systemPrompt,
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm sorry, I'm having trouble responding right now. Let me connect you with a team member who can help! 🙏";
  }
}
