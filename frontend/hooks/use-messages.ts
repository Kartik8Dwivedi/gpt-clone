"use client"

import { useState, useCallback, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import {
  getMessages,
  sendMessage as apiSendMessage,
  editMessage as apiEditMessage,
  deleteMessage as apiDeleteMessage,
  regenerateMessage as apiRegenerateMessage,
} from "@/lib/api"
import { toast } from "sonner"

interface Message {
  _id: string
  conversationId: string
  sender: "user" | "assistant"
  content: string
  files?: string[]
  createdAt: string
  edited?: boolean
  isLoading?: boolean
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { getToken } = useAuth()

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  const refreshMessages = useCallback(async () => {
    if (!isMounted) return

    if (!conversationId) {
      if (isMounted) {
        setMessages([])
      }
      return
    }

    if (isMounted) {
      setIsLoading(true)
    }

    try {
      const token = await getToken()
      if (token && isMounted) {
        const data = await getMessages(conversationId, token)
        if (isMounted) {
          setMessages(data)
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      if (isMounted) {
        setIsLoading(false)
      }
    }
  }, [conversationId, getToken, isMounted])

  useEffect(() => {
    if (isMounted) {
      refreshMessages()
    }
  }, [refreshMessages, isMounted])

  const sendMessage = useCallback(
    async (content: string, files?: string[], convId?: string) => {
      if (!isMounted) return

      const id = convId || conversationId;
      if (!id) {
        console.error("No conversation ID available for sending message");
        return;
      }

      const tempId = `temp_${Date.now()}`;
      const userMessage: Message = {
        _id: tempId,
        conversationId: id,
        sender: "user",
        content,
        files,
        createdAt: new Date().toISOString(),
      }

      // Add user message and loading indicator immediately
      if (isMounted) {
        setMessages((prev) => [...prev, userMessage, { _id: `loading_${tempId}`, conversationId: id, sender: 'assistant', content: '', createdAt: new Date().toISOString(), isLoading: true }])
      }

      try {
        const token = await getToken()
        if (!token) {
          const error = "No authentication token available"
          toast.error(error)
          throw new Error(error)
        }

        console.log("[v0] Sending message with conversationId:", id)
        const response = await apiSendMessage(id, content, files || [], token)

        // Replace temp message with real one and add AI response
        if (isMounted) {
          setMessages((prev) => [
            ...prev.filter((m) => m._id !== tempId && m._id !== `loading_${tempId}`),
            response.userMessage,
            response.aiMessage,
          ])
          toast.success("Message sent successfully")
        }
        return response.updatedConversation
      } catch (error) {
        console.error("[v0] Send message error:", error)
        // Remove temp message on error
        if (isMounted) {
          setMessages((prev) => prev.filter((m) => m._id !== tempId && m._id !== `loading_${tempId}`))
        }
        const errorMessage = error instanceof Error ? error.message : "Failed to send message"
        toast.error(errorMessage)
        throw error
      }
    },
    [conversationId, getToken, isMounted],
  )

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!isMounted) return

      try {
        const token = await getToken()
        if (!token) {
          const error = "No authentication token available"
          toast.error(error)
          throw new Error(error)
        }

        const updatedMessage = await apiEditMessage(conversationId!, messageId, content, token)
        if (isMounted) {
          setMessages((prev) => prev.map((m) => (m._id === messageId ? updatedMessage : m)))
          toast.success("Message edited successfully")
        }
      } catch (error) {
        console.error("Edit message error:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to edit message"
        toast.error(errorMessage)
        throw error
      }
    },
    [conversationId, getToken, isMounted],
  )

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!isMounted) return

      try {
        const token = await getToken()
        if (!token) {
          const error = "No authentication token available"
          toast.error(error)
          throw new Error(error)
        }

        await apiDeleteMessage(conversationId!, messageId, token)
        if (isMounted) {
          setMessages((prev) => prev.filter((m) => m._id !== messageId))
          toast.success("Message deleted successfully")
        }
      } catch (error) {
        console.error("Delete message error:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to delete message"
        toast.error(errorMessage)
        throw error
      }
    },
    [conversationId, getToken, isMounted],
  )

  const regenerateMessage = useCallback(
    async (messageId: string) => {
      if (!isMounted) return;

      const originalMessageIndex = messages.findIndex((m) => m._id === messageId);
      if (originalMessageIndex === -1) return;

      const userMessage = messages[originalMessageIndex - 1];
      if (!userMessage || userMessage.sender !== "user") return;

      if (isMounted) {
        setMessages((prev) =>
          prev.map((m, i) =>
            i === originalMessageIndex ? { ...m, isLoading: true } : m
          )
        );
      }

      try {
        const token = await getToken();
        if (!token) {
          throw new Error("No authentication token available");
        }

        const response = await apiRegenerateMessage(conversationId!, userMessage.content, token);

        if (isMounted) {
          setMessages((prev) =>
            prev.map((m, i) =>
              i === originalMessageIndex ? { ...response.aiMessage, isLoading: false } : m
            )
          );
          toast.success("Message regenerated successfully");
        }
      } catch (error) {
        console.error("Regenerate message error:", error);
        if (isMounted) {
          setMessages((prev) =>
            prev.map((m, i) =>
              i === originalMessageIndex ? { ...m, isLoading: false } : m
            )
          );
        }
        const errorMessage = error instanceof Error ? error.message : "Failed to regenerate message";
        toast.error(errorMessage);
      }
    },
    [conversationId, getToken, isMounted, messages]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    editMessage,
    deleteMessage,
    regenerateMessage,
    refreshMessages,
  }
}
