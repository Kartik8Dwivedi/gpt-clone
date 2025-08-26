import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import ChatService from "@/lib/services/chat.service";
import AppError from "@/lib/utils/AppError";
import logger from "@/lib/logger";
import connectToDB from "@/lib/db";
import { Types } from "mongoose";

const chatService = new ChatService();

export async function POST(
  request: Request,
  { params }: { params: { conversationId: string; messageId: string } }
) {
  try {
    await connectToDB();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(new AppError("Unauthorized", 401), {
        status: 401,
      });
    }

    const { conversationId, messageId } = params;

    if (
      !Types.ObjectId.isValid(conversationId) ||
      !Types.ObjectId.isValid(messageId)
    ) {
      return NextResponse.json(
        new AppError("Invalid Conversation or Message ID", 400),
        { status: 400 }
      );
    }

    const stream = await chatService.regenerateMessage(
      new Types.ObjectId(conversationId),
      new Types.ObjectId(messageId)
    );

    return stream;
  } catch (error: any) {
    logger.error(`Error regenerating message: ${error.message}`);
    return NextResponse.json(
      new AppError(
        error.message || "Failed to regenerate message",
        error.statusCode || 500
      ),
      { status: error.statusCode || 500 }
    );
  }
}
