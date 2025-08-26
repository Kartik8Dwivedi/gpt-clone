import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import ChatService from '@/lib/services/chat.service';
import AppError from '@/lib/utils/AppError';
import AppSuccess from '@/lib/utils/AppSuccess';
import logger from '@/lib/logger';
import connectToDB from '@/lib/db';

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

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    logger.warn("Unauthorized request to fetch conversations.");
    return NextResponse.json(new AppError("Unauthorized", 401), { status: 401 });
  }

  logger.info(`Fetching conversations for user: ${userId}`);
  return handleRequest(() => chatService.getUserConversations(userId));
}
