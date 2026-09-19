import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

export async function generateAIResponse(
  systemPrompt: string,
  conversationHistory: { role: string; content: string }[],
  userMessage: string
): Promise<string> {
  try {
    const contents = [
      ...conversationHistory.map((msg) => ({
        role: msg.role === "customer" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      { role: "user", parts: [{ text: userMessage }] },
    ];

    const result = await geminiModel.generateContent({
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
