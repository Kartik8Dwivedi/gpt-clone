import { auth } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import AppError from "@/lib/utils/AppError";
import ChatService from '@/lib/services/chat.service';

const chatService = new ChatService();

export async function PUT(
  req: Request,
  { params }: { params: { conversationId: string; messageId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    const updatedMessage = await chatService.editMessage(
      params.messageId,
      userId,
      content
    );

    return NextResponse.json(updatedMessage);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to edit message" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { conversationId: string; messageId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await chatService.deleteMessage(params.messageId, userId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete message" },
      { status: 500 }
    );
  }
}


export async function POST(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  const { conversationId } = params;
  const { messageId } = await req.json(); 

  if (!messageId) {
    return NextResponse.json(
      { error: "messageId is required" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    id: crypto.randomUUID(),
    userMessageId: messageId,
    content: "🔁 Regenerated reply (stub) — wire this to your LLM.",
  });
}
