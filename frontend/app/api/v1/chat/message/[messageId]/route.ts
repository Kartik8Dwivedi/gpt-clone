import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import ChatService from '@/lib/services/chat.service';
import AppError from '@/lib/utils/AppError';
import AppSuccess from '@/lib/utils/AppSuccess';
import logger from '@/lib/logger';
import connectToDB from '@/lib/db';
import { Types } from 'mongoose';

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

    return NextResponse.json(successResponse, { status: successResponse.statusCode });
  } catch (error: any) {
    const errorResponse = new AppError(
      error.message || "Something went wrong",
      error.statusCode || 500
    );

    logger.error(
      `Error handling request. Status: ${errorResponse.statusCode}, Error: ${errorResponse.error}`
    );

    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
};

export async function PUT(request: Request, { params }: { params: { messageId: string } }) {
  const { userId } = auth();
  if (!userId) {
    logger.warn("Unauthorized request to edit message.");
    return NextResponse.json(new AppError("Unauthorized", 401), { status: 401 });
  }

  const { messageId } = params;
  if (!Types.ObjectId.isValid(messageId)) {
    return NextResponse.json(new AppError("Invalid Message ID", 400), { status: 400 });
  }

  const body = await request.json();
  const { content } = body;

  logger.info(`Editing message: ${messageId}`);
  return handleRequest(() => chatService.editMessage(messageId, content));
}

export async function DELETE(request: Request, { params }: { params: { messageId: string } }) {
  const { userId } = auth();
  if (!userId) {
    logger.warn("Unauthorized request to delete message.");
    return NextResponse.json(new AppError("Unauthorized", 401), { status: 401 });
  }

  const { messageId } = params;
  if (!Types.ObjectId.isValid(messageId)) {
    return NextResponse.json(new AppError("Invalid Message ID", 400), { status: 400 });
  }

  logger.info(`Deleting message: ${messageId}`);
  return handleRequest(() => chatService.deleteMessage(messageId));
}
