import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import AuthService from '@/lib/services/auth.service';
import AppError from '@/lib/utils/AppError';
import AppSuccess from '@/lib/utils/AppSuccess';
import logger from '@/lib/logger';
import connectToDB from '@/lib/db';

const authService = new AuthService();

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

export async function POST(request: Request) {
  logger.info("Received request to sync user.");
  const body = await request.json();
  return handleRequest(() => authService.syncUser(body), 201);
}

export async function GET(request: Request) {
  logger.info("Received request to fetch user profile.");
  const { userId } = auth();

  if (!userId) {
    logger.warn("Unauthorized request to /me endpoint.");
    return NextResponse.json(new AppError("Unauthorized", 401), { status: 401 });
  }

  return handleRequest(() => authService.getUserProfile(userId));
}
