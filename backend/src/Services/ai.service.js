import { GoogleGenerativeAI } from "@google/generative-ai";
import AppConfig from "../Config/AppConfig.js"

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(AppConfig.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateResponse(conversationHistory, memory) {
    try {
      // Build prompt from user messages + conversation context
      const context = memory ? `Context: ${memory}\n\n` : "";
      const userMessages = conversationHistory
        .map((msg) => `${msg.sender}: ${msg.content}`)
        .join("\n");

      const prompt = `${context}\n${userMessages}\nassistant:`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Gemini Error:", error);
      throw new Error("Failed to generate AI response");
    }
  }
}

export default new AIService();
