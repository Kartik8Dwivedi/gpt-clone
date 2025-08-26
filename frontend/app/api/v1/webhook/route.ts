import { NextResponse } from 'next/server';
import AuthService from '@/lib/services/auth.service';
import FileService from '@/lib/services/file.service';
import logger from '@/lib/logger';
import connectToDB from '@/lib/db';

const authService = new AuthService();
const fileService = new FileService();

export async function POST(request: Request) {
  try {
    await connectToDB(); // Ensure DB connection for each request
    const body = await request.json();
    const event = body.type || body.event; // Handle both Clerk and generic file webhooks
    const data = body.data;

    logger.info(`Received webhook: ${event}`);

    switch (event) {
      case "user.created":
        await authService.syncUser(data);
        break;
      case "user.updated":
        // TODO: Implement updateUserByClerkId in AuthService and UserRepository
        // await authService.updateUserByClerkId(data.id, data);
        logger.warn(`Unhandled user.updated webhook. Data: ${JSON.stringify(data)}`);
        break;
      case "user.deleted":
        // TODO: Implement deleteUserByClerkId in AuthService and UserRepository
        // await authService.deleteUserByClerkId(data.id);
        logger.warn(`Unhandled user.deleted webhook. Data: ${JSON.stringify(data)}`);
        break;
      case "file.uploaded":
        // TODO: Implement markUploaded in FileService
        // await fileService.markUploaded(fileData.uuid || fileData.public_id, fileData);
        logger.warn(`Unhandled file.uploaded webhook. Data: ${JSON.stringify(data)}`);
        break;
      case "file.deleted":
        // TODO: Implement markDeleted in FileService
        // await fileService.markDeleted(fileData.uuid || fileData.public_id);
        logger.warn(`Unhandled file.deleted webhook. Data: ${JSON.stringify(data)}`);
        break;
      default:
        logger.warn(`Unhandled webhook event: ${event}. Data: ${JSON.stringify(data)}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    logger.error("Error handling webhook:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
