import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import ChatService from "@/lib/services/chat.service";
import AppError from "@/lib/utils/AppError";
import AppSuccess from "@/lib/utils/AppSuccess";
import logger from "@/lib/logger";
import connectToDB from "@/lib/db";
import mongoose, { Types } from "mongoose";

const chatService = new ChatService();

// Helper function to handle requests and standardize responses
const handleRequest = async (
  serviceCall: () => Promise<any>,
  successStatusCode: number = 200
) => {
  try {
    await connectToDB(); // Ensure DB connection for each request
    const result = await serviceCall();
    const successResponse = new AppSuccess(
      result.data,
      result.message,
      successStatusCode
    );

    logger.info(
      `Request handled successfully. Status: ${successResponse.statusCode}, Message: ${successResponse.message}`
    );

    return NextResponse.json(successResponse, {
      status: successResponse.statusCode,
    });
  } catch (error: any) {
    const errorResponse = new AppError(
      error.message || "Something went wrong",
      error.statusCode || 500
    );

    logger.error(
      `Error handling request. Status: ${errorResponse.statusCode}, Error: ${errorResponse.error}`
    );

    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
};

export async function POST(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(new AppError("Unauthorized", 401), {
      status: 401,
    });
  }

  const { conversationId } = params;
  if (!Types.ObjectId.isValid(conversationId)) {
    return NextResponse.json(new AppError("Invalid Conversation ID", 400), {
      status: 400,
    });
  }

  await connectToDB();

  const body = await request.json();
  const { content, files } = body;

  try {
    const { content, files, sender } = body;

    if (sender === "user") {
      await chatService.addMessage(
        userId,
        conversationId,
        "user",
        content,
        files
      );

      // Fetch conversation history
      const conversation = await chatService.getConversation(new Types.ObjectId(conversationId));
      console.log("Conversation fetched in the controller: ", conversation);
      if (!conversation?.data) {
        throw new AppError("Conversation not found or no messages", 404);
      }

      const history = conversation.data;

      // Build messages for Gemini, including history
      const messages = [{ role: "system", content: "You are a helpful assistant." }];

      history.forEach((msg: any) => {
        if (msg.sender === "user" || msg.sender === "assistant") {
          messages.push({ role: msg.sender, content: msg.content });
        }
      });

      // Add the current user message (which was just saved)
      messages.push({ role: "user", content });

      // 3️⃣ Stream assistant reply with Vercel AI SDK
      return chatService.streamAssistantReply(messages, request);
    } else if (sender === "assistant") {
      // Save assistant message to DB after streaming is complete
      await chatService.addMessage(
        userId,
        conversationId,
        "assistant",
        content,
        files
      );
      return NextResponse.json(new AppSuccess(null, "Assistant message saved", 200), { status: 200 });
    } else {
      return NextResponse.json(new AppError("Invalid sender type", 400), { status: 400 });
    }
  } catch (error: any) {
    const errorResponse = new AppError(
      error.message || "Something went wrong",
      error.statusCode || 500
    );
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    logger.warn("Unauthorized request to get conversation.");
    return NextResponse.json(new AppError("Unauthorized", 401), {
      status: 401,
    });
  }

  const { conversationId } = params;
  if (!Types.ObjectId.isValid(conversationId)) {
    return NextResponse.json(new AppError("Invalid Conversation ID", 400), {
      status: 400,
    });
  }

  logger.info(`Fetching conversation: ${conversationId}`);
  return handleRequest(() =>
    chatService.getConversation(new Types.ObjectId(conversationId))
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    logger.warn("Unauthorized request to delete conversation.");
    return NextResponse.json(new AppError("Unauthorized", 401), {
      status: 401,
    });
  }

  const { conversationId } = params;
  if (!Types.ObjectId.isValid(conversationId)) {
    return NextResponse.json(new AppError("Invalid Conversation ID", 400), {
      status: 400,
    });
  }

  logger.info(`Deleting conversation: ${conversationId}`);
  return handleRequest(() => chatService.deleteConversation(conversationId));
}

export async function PUT(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    logger.warn("Unauthorized request to regenerate message.");
    return NextResponse.json(new AppError("Unauthorized", 401), {
      status: 401,
    });
  }

  const { conversationId } = params;
  if (!Types.ObjectId.isValid(conversationId)) {
    return NextResponse.json(new AppError("Invalid Conversation ID", 400), {
      status: 400,
    });
  }

  const body = await request.json();
  const { content } = body;

  logger.info(`Regenerating message for conversation: ${conversationId}`);
  return handleRequest(() =>
    chatService.regenerateMessage(new Types.ObjectId(conversationId), content)
  );
}
