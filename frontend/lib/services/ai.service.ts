import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import AppConfig from "../config"; // Import the centralized config
import logger from "../logger"; // Import the logger

interface Message {
  sender: string;
  content: string;
}

class AIService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    if (!AppConfig.GEMINI_API_KEY) {
      logger.error("GEMINI_API_KEY is not set in AppConfig.");
      throw new Error("GEMINI_API_KEY is not set.");
    }
    this.genAI = new GoogleGenerativeAI(AppConfig.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateResponse(conversationHistory: Message[], memory: string | null): Promise<string> {
    try {
      const context = memory ? `Context: ${memory}\n\n` : "";
      const userMessages = conversationHistory
        .map((msg) => `${msg.sender}: ${msg.content}`)
        .join("\n");

      const prompt = `${context}\n${userMessages}\nassistant:`

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      logger.error("Gemini Error (generateResponse):", error);
      throw new Error("Failed to generate AI response");
    }
  }

  async generateTitle(conversationHistory: Message[]): Promise<string> {
    try {
      const userMessages = conversationHistory
        .map((msg) => `${msg.sender}: ${msg.content}`)
        .join("\n");

      const prompt = `Based on the following conversation, suggest a short, 2-3 word title for the chat. The title should be descriptive and concise. Examples: "Sidebar UI refinement", "API design discussion", "Build and Deploy app".\n\nConversation:\n${userMessages}\n\nTitle:`

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      logger.error("Gemini Error (generateTitle):", error);
      throw new Error("Failed to generate title");
    }
  }
}

export default new AIService();
