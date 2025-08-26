import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import FileService from '@/lib/services/file.service';
import AppError from '@/lib/utils/AppError';
import AppSuccess from '@/lib/utils/AppSuccess';
import logger from '@/lib/logger';
import connectToDB from '@/lib/db';
import FileRepository from "@/lib/repositories/file.repository";
import cloudinary from "@/lib/utils/cloudinary";

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

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) throw new AppError("Unauthorized", 401);

    const contentType = request.headers.get("content-type") || "";

    // ---- New: handle real files (multipart) ----
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const blobs = form.getAll("files");
      if (!blobs.length) throw new AppError("No files provided", 400);

      const fileRepo = new FileRepository();
      const saved: any[] = [];

      for (const blob of blobs) {
        if (!(blob instanceof File)) continue;

        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploaded: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "uploads",
              use_filename: true,
              filename_override: blob.name,
            },
            (err, res) => (err ? reject(err) : resolve(res))
          );
          stream.end(buffer);
        });

        const doc = await fileRepo.create({
          userId,
          url: uploaded.secure_url,
          type: blob.type,
          size: blob.size,
          name: uploaded.original_filename,
          originalName: blob.name,
          metadata: uploaded,
        });
        saved.push(doc);
      }

      return NextResponse.json(new AppSuccess("Files uploaded", saved), {
        status: 201,
      });
    }

    // ---- Existing JSON body path (kept) ----
    const body = await request.json();
    const { path, type, size, name, originalName } = body || {};
    if (!path || !type || !size)
      throw new AppError("Missing file data (path/type/size)", 400);

    const uploaded = await cloudinary.uploader.upload(path, {
      resource_type: "auto",
    });

    const fileRepo = new FileRepository();
    const file = await fileRepo.create({
      userId,
      url: uploaded.secure_url,
      type,
      size,
      name: name || uploaded.original_filename,
      originalName: originalName || uploaded.original_filename,
      metadata: uploaded,
    });

    return NextResponse.json(new AppSuccess("File uploaded", file), {
      status: 201,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      new AppError(error.message || "Failed to upload file", status),
      { status }
    );
  }
}

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    logger.warn("Unauthorized request to get user files.");
    return NextResponse.json(new AppError("Unauthorized", 401), { status: 401 });
  }

  logger.info(`Fetching files for user ${userId}`);
  return handleRequest(() => fileService.getUserFiles(userId));
}
