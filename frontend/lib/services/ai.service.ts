import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import AppConfig from "../config";
import logger from "../logger";

interface Message {
  sender: string;
  content: string;
}

class AIService {
  private google;

  constructor() {
    if (!AppConfig.GEMINI_API_KEY) {
      logger.error("GEMINI_API_KEY is not set in AppConfig.");
      throw new Error("GEMINI_API_KEY is not set.");
    }

    this.google = createGoogleGenerativeAI({
      apiKey: AppConfig.GEMINI_API_KEY,
    });
  }

  async generateResponse(
    conversationHistory: Message[],
    memory: string | null
  ): Promise<string> {
    try {
      const context = memory ? `Context: ${memory}\n\n` : "";
      const userMessages = conversationHistory
        .map((msg) => `${msg.sender}: ${msg.content}`)
        .join("\n");

      const prompt = `${context}\n${userMessages}\nassistant:`;

      const { text } = await generateText({
        model: this.google("gemini-2.5-flash"),
        prompt,
      });

      return text;
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

      const prompt = `Based on the following conversation, suggest a short, 2-3 word title for the chat. The title should be descriptive and concise. Examples: "Sidebar UI refinement", "API design discussion", "Build and Deploy app".\n\nConversation:\n${userMessages}\n\nTitle:`;

      const { text } = await generateText({
        model: this.google("gemini-2.5-flash"),
        prompt,
      });

      return text;
    } catch (error: any) {
      logger.error("Gemini Error (generateTitle):", error);
      throw new Error("Failed to generate title");
    }
  }
}

export default new AIService();
