import { generateText, streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import AppConfig from "../config";
import logger from "../logger";
import MessageModel from "@/lib/models/message.model";
import MemoryClient from "mem0ai";

interface Message {
  sender: string;
  content: string;
  role?: "user" | "assistant" | "system";
}

class AIService {
  private google;
  private memoryClient: MemoryClient;

  constructor() {
    if (!AppConfig.GEMINI_API_KEY) {
      logger.error("GEMINI_API_KEY is not set in AppConfig.");
      throw new Error("GEMINI_API_KEY is not set.");
    }
    if (!AppConfig.MEM0_API_KEY) {
      logger.error("MEM0_API_KEY is not set in AppConfig.");
      throw new Error("MEM0_API_KEY is not set.");
    }

    this.google = createGoogleGenerativeAI({
      apiKey: AppConfig.GEMINI_API_KEY,
    });

    this.memoryClient = new MemoryClient({
      apiKey: AppConfig.MEM0_API_KEY,
      api_version: "v1", // ✅ required
    });
  }

  async generateResponse(
    userId: string,
    conversationId: string,
    newMessage: string
  ): Promise<AsyncIterable<string>> {
    try {
      const recentMessages = await MessageModel.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      console.log("NewMessage: ", newMessage);
      console.log("typeof newMessage: ", typeof newMessage);

      // Conversation memories
      // const mem0Conversation = await this.memoryClient.search(
      //   String(newMessage),
      //   {
      //     user_id: String(userId),
      //     metadata: { conversationId: String(conversationId) },
      //     limit: 5,
      //   }
      // );

      //   const mem0UserPrefs = await this.memoryClient.search(
      //     "user preferences",
      //     {
      //       user_id: String(userId),
      //       limit: 3,
      //     }
      //   );
      const [mem0Conversation, mem0UserPrefs] = await Promise.all([
        this.memoryClient.search(String(newMessage), {
          user_id: String(userId),
          metadata: { conversationId: String(conversationId) },
          limit: 5,
        }),
        this.memoryClient.search("user preferences", {
          user_id: String(userId),
          limit: 3,
        }),
      ]);

      const extractPreferences = (prefs: any[]) =>
        prefs.map((p) => p.content || p.text).join(", ") ||
        "no special preferences";

      const systemPrompt = `
        You are a helpful assistant.
        User preferences: ${extractPreferences(mem0UserPrefs)}.
      `;

      const contextMessages = [
        ...recentMessages.reverse().map((m) => ({
          role: m.role || (m.sender === "assistant" ? "assistant" : "user"),
          content: m.content,
        })),
        ...mem0Conversation.map((m) => ({
          role: "system" as const,
          content: `Memory: ${m.content || m.text}`,
        })),
      ];

      const result = await streamText({
        model: this.google("gemini-2.5-flash"),
        system: systemPrompt,
        messages: [...contextMessages, { role: "user", content: newMessage }],
      });

      // Do not await the memoryClient.add call here, as it will block the streaming.
      // We will handle this in the API route after the streaming is complete.
      this.memoryClient.add(
        [
          {
            role: "user",
            content: String(newMessage),
          },
        ],
        {
          user_id: String(userId),
          metadata: { conversationId: String(conversationId) },
        }
      );

      return result.textStream;
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

      const prompt = `
        Based on the following conversation, suggest a short, 2-3 word title.
        Examples: "Sidebar UI refinement", "API design discussion", "Build and Deploy app".

        Conversation:
        ${userMessages}

        Title:
      `;

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
