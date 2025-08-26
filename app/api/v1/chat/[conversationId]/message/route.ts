import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import ChatService from "@/lib/services/chat.service";
import AppError from "@/lib/utils/AppError";
import AppSuccess from "@/lib/utils/AppSuccess";
import logger from "@/lib/logger";
import connectToDB from "@/lib/db";
import mongoose, { Types } from "mongoose";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

import cloudinary from "@/lib/utils/cloudinary";
import { parseForm } from "@/lib/utils/parseForm";

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

  try {
    const { fields, files } = await parseForm(request);
    console.log("FIELDS:::::::::::::", fields);
    console.log("HAVING TYPE: ", typeof fields);
    console.log("FILES:::::::::::::", JSON.stringify(files));
    console.log("HAVING TYPE: ", typeof files);

    const content = fields.content[0];
    const sender = fields.sender[0];

    // Normalize uploaded files
    const fileArray = Array.isArray(files.files)
      ? files.files
      : files.files
      ? [files.files]
      : [];

    // Upload each file to Cloudinary and prepare file info
    const uploadedFiles = await Promise.all(
      fileArray.map(async (file: any) => {
        const cloudinaryRes = await uploadFileToCloudinary(
          file.filepath,
          file.mimetype
        );
        return {
          url: cloudinaryRes.secure_url,
          mimeType: file.mimetype,
        };
      })
    );

    console.log("SENDER::", sender);

    if (sender === "user") {
      // Save user message
      await chatService.addMessage(
        userId,
        conversationId,
        "user",
        content,
        uploadedFiles
      );

      // Fetch conversation history
      const conversation = await chatService.getConversation(
        new Types.ObjectId(conversationId)
      );
      if (!conversation?.data) {
        throw new AppError("Conversation not found or no messages", 404);
      }

      const history = conversation.data;

      // Build LLM messages
      const messagesForLLM: any[] = [
        { role: "system", content: "You are a helpful assistant." },
        ...history.map((msg) => ({
          role: msg.sender,
          content: [{ type: "text", text: msg.content }],
        })),
      ];

      const userContentParts: any[] = [];
      if (content) {
        userContentParts.push({ type: "text", text: content });
      }

      uploadedFiles.forEach((f) => {
        if (f.mimeType.startsWith("image/")) {
          userContentParts.push({
            type: "input_image",
            image_url: f.url,
          });
        } else {
          userContentParts.push({
            type: "text",
            text: `User uploaded a file: ${f.url}`,
          });
        }
      });

      if (userContentParts.length > 0) {
        messagesForLLM.push({ role: "user", content: userContentParts });
      }

      const result = await generateText({
        model: google("gemini-1.5-flash"),
        messages: messagesForLLM,
        providerOptions: {
          google: {
            responseModalities: ["TEXT"],
          },
        },
      });

      const assistantText = result?.text || "I couldn't generate a response.";

      // Save assistant reply
      await chatService.addMessage(
        userId,
        conversationId,
        "assistant",
        assistantText,
        []
      );

      return NextResponse.json({ content: assistantText }, { status: 200 });
    }

    // Handle assistant sender
    else if (sender === "assistant") {
      await chatService.addMessage(
        userId,
        conversationId,
        "assistant",
        content,
        uploadedFiles
      );
      return NextResponse.json(
        new AppSuccess(null, "Assistant message saved", 200),
        {
          status: 200,
        }
      );
    }

    return NextResponse.json(new AppError("Invalid sender type", 400), {
      status: 400,
    });
  } catch (error: any) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      new AppError(
        error.message || "Internal server error",
        error.statusCode || 500
      ),
      { status: error.statusCode || 500 }
    );
  }
}


cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = async (
  filepath: string,
  resourceType: string
) => {
  return await cloudinary.uploader.upload(filepath, {
    resource_type: resourceType.startsWith("image/") ? "image" : "auto",
  });
};

function normalizeMessagesForGemini(messages: any[]) {
  return messages.map((msg) => ({
    role: msg.sender === "user" ? "user" : "model",
    parts: [
      ...(msg.content ? [{ text: msg.content }] : []),
      ...(msg.files?.map((f: any) => ({
        fileData: {
          mimeType: f.mimeType,
          fileUri: f.url, 
        },
      })) || []),
    ],
  }));
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

  const { messageId } = await request.json(); 

  const conversation = await chatService.getConversation(
    new Types.ObjectId(conversationId)
  );
  if (!conversation?.data) {
    throw new AppError("Conversation not found or no messages", 404);
  }

  // find the user message just before the assistant message being regenerated
  const history = conversation.data;
  const index = history.findIndex((m) => String(m._id) === messageId);
  if (index === -1) throw new AppError("Message not found", 404);

  if (history[index].sender !== "assistant") {
    throw new AppError("Only assistant messages can be regenerated", 400);
  }

  const truncated = history.slice(0, index);
  const messages = [
    { role: "system", content: "You are a helpful assistant." },
  ];
  truncated.forEach((m) => {
    if (m.sender === "user" || m.sender === "assistant") {
      messages.push({ role: m.sender, content: m.content });
    }
  });

  return chatService.streamAssistantReply(messages, request);
}

