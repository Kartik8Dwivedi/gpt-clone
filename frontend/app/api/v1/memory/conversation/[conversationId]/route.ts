import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import MemoryService from '@/lib/services/memory.service';
import AppError from '@/lib/utils/AppError';
import AppSuccess from '@/lib/utils/AppSuccess';
import logger from '@/lib/logger';
import connectToDB from '@/lib/db';
import { Types } from 'mongoose';

const memoryService = new MemoryService();

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

export async function GET(request: Request, { params }: { params: { conversationId: string } }) {
  const { userId } = auth();
  if (!userId) {
    logger.warn("Unauthorized request to get conversation memory.");
    return NextResponse.json(new AppError("Unauthorized", 401), { status: 401 });
  }

  const { conversationId } = params;
  if (!Types.ObjectId.isValid(conversationId)) {
    return NextResponse.json(new AppError("Invalid Conversation ID", 400), { status: 400 });
  }

  logger.info(`Fetching conversation memory for conversation: ${conversationId}`);
  return handleRequest(() => memoryService.getConversationMemory(new Types.ObjectId(conversationId)));
}
