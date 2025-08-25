import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import FileService from '@/lib/services/file.service';
import AppError from '@/lib/utils/AppError';
import AppSuccess from '@/lib/utils/AppSuccess';
import logger from '@/lib/logger';
import connectToDB from '@/lib/db';
import { Types } from 'mongoose';

const fileService = new FileService();

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

export async function GET(request: Request, { params }: { params: { fileId: string } }) {
  const { userId } = auth();
  if (!userId) {
    logger.warn("Unauthorized request to get file.");
    return NextResponse.json(new AppError("Unauthorized", 401), { status: 401 });
  }

  const { fileId } = params;
  if (!Types.ObjectId.isValid(fileId)) {
    return NextResponse.json(new AppError("Invalid File ID", 400), { status: 400 });
  }

  logger.info(`Fetching file: ${fileId}`);
  return handleRequest(() => fileService.getFile(fileId));
}

export async function DELETE(request: Request, { params }: { params: { fileId: string } }) {
  const { userId } = auth();
  if (!userId) {
    logger.warn("Unauthorized request to delete file.");
    return NextResponse.json(new AppError("Unauthorized", 401), { status: 401 });
  }

  const { fileId } = params;
  if (!Types.ObjectId.isValid(fileId)) {
    return NextResponse.json(new AppError("Invalid File ID", 400), { status: 400 });
  }

  logger.info(`Deleting file: ${fileId}`);
  return handleRequest(() => fileService.deleteFile(fileId));
}
