"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  getMessages,
  sendMessage as apiSendMessage,
  regenerateMessage as apiRegenerateMessage,
} from "@/lib/api";
import { toast } from "sonner";
import { streamAssistantResponse } from "@/lib/stream-utils";

interface Message {
  _id: string;
  conversationId: string;
  sender: "user" | "assistant";
  content: string;
  files?: string[];
  createdAt: string;
  edited?: boolean;
  isLoading?: boolean;
  isStreaming?: boolean;
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const refreshMessages = useCallback(async () => {
    if (!isMounted) return;

    if (!conversationId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      if (token && isMounted) {
        const data = await getMessages(conversationId, token);
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      if (isMounted) setIsLoading(false);
    }
  }, [conversationId, getToken, isMounted]);

  useEffect(() => {
    if (isMounted) refreshMessages();
  }, [refreshMessages, isMounted]);

  /**
   * Send Message (streamed AI reply)
   */
  const sendMessage = useCallback(
    async (content: string, files?: string[], convId?: string) => {
      if (!isMounted) return;
      const id = convId || conversationId;
      if (!id) return console.error("No conversation ID available");

      const tempId = `temp_${Date.now()}`;
      const userMessage: Message = {
        _id: tempId,
        conversationId: id,
        sender: "user",
        content,
        files,
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          _id: `loading_${tempId}`,
          conversationId: id,
          sender: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
          isLoading: true,
          isStreaming: true,
        },
      ]);

      try {
        const token = await getToken();
        if (!token) throw new Error("No auth token");

        const response = await apiSendMessage(id, content, files || [], token);

        await streamAssistantResponse(
          response,
          id,
          setMessages,
          refreshMessages
        );

        toast.success("Message sent successfully");
      } catch (error) {
        console.error("Send message error:", error);
        setMessages((prev) =>
          prev.filter((m) => m._id !== tempId && m._id !== `loading_${tempId}`)
        );
        toast.error(
          error instanceof Error ? error.message : "Failed to send message"
        );
        throw error;
      }
    },
    [conversationId, getToken, isMounted, refreshMessages]
  );

  /**
   * Edit Message (JSON only, no streaming)
   */
  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!conversationId) return;
      try {
        const token = await getToken();
        if (!token) throw new Error("No auth token");

        const res = await fetch(
          `/api/v1/chat/${conversationId}/message/${messageId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content }),
          }
        );
        if (!res.ok) throw new Error("Failed to edit message");

        await refreshMessages();
        toast.success("Message edited successfully");
      } catch (error) {
        console.error("Edit message error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to edit message"
        );
      }
    },
    [conversationId, getToken, refreshMessages]
  );

  /**
   * Delete Message (JSON only, no streaming)
   */
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!conversationId) return;

      // 1. Optimistically remove the message from the UI
      const originalMessages = messages;
      setMessages((prev) => prev.filter((m) => m._id !== messageId));

      try {
        const token = await getToken();
        if (!token) throw new Error("No auth token");

        const res = await fetch(
          `/api/v1/chat/${conversationId}/message/${messageId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          // 2. If the API call fails, revert the optimistic update
          toast.error("Failed to delete message. Restoring...");
          setMessages(originalMessages);
          return;
        }

        toast.success("Message deleted successfully");
        // 3. On success, do nothing. The UI is already updated.

      } catch (error) {
        console.error("Delete message error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to delete message"
        );
        // Revert on any other error
        setMessages(originalMessages);
      }
    },
    [conversationId, getToken, refreshMessages]
  );

  /**
   * Regenerate Message (streamed AI reply, replaces existing assistant bubble)
   */
  const regenerateMessage = useCallback(
    async (messageId: string) => {
      if (!conversationId) return;
      try {
        const token = await getToken();
        if (!token) throw new Error("No auth token");

        // Mark the assistant message as "streaming" and clear its content
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, content: "", isStreaming: true, isLoading: true }
              : m
          )
        );

        const response = await apiRegenerateMessage(
          conversationId,
          messageId,
          token
        );

        await streamAssistantResponse(
          response,
          conversationId,
          setMessages,
          refreshMessages,
          {
            replaceMessageId: messageId,
          }
        );

        toast.success("Message regenerated successfully");
      } catch (error) {
        console.error("Regenerate message error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to regenerate message"
        );
      }
    },
    [conversationId, getToken, refreshMessages]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    editMessage,
    deleteMessage,
    regenerateMessage,
    refreshMessages,
  };
}
