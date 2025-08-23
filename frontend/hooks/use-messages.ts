"use client"

import { useState, useCallback, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import {
  getMessages,
  sendMessage as apiSendMessage,
  editMessage as apiEditMessage,
  deleteMessage as apiDeleteMessage,
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
    async (content: string, files?: string[]) => {
      if (!isMounted) return

      const userMessage: Message = {
        _id: `temp_${Date.now()}`,
        conversationId: conversationId!,
        sender: "user",
        content,
        files,
        createdAt: new Date().toISOString(),
      }

      if (!conversationId) {
        const error = "No conversation ID available for sending message"
        console.error(error)
        toast.error("Please start a new conversation first")
        return
      }

      try {
        const token = await getToken()
        if (!token) {
          const error = "No authentication token available"
          toast.error(error)
          throw new Error(error)
        }

        // Add user message immediately
        if (isMounted) {
          setMessages((prev) => [...prev, userMessage])
        }

        console.log("[v0] Sending message with conversationId:", conversationId)
        const response = await apiSendMessage(conversationId, content, files || [], token)

        // Replace temp message with real one and add AI response
        if (isMounted) {
          setMessages((prev) => [
            ...prev.filter((m) => m._id !== userMessage._id),
            response.userMessage,
            response.aiMessage,
          ])
          toast.success("Message sent successfully")
        }
      } catch (error) {
        console.error("[v0] Send message error:", error)
        // Remove temp message on error
        if (isMounted) {
          setMessages((prev) => prev.filter((m) => m._id !== userMessage._id))
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
      if (!isMounted) return

      // TODO: Implement regenerate message functionality
      console.log("Regenerate message:", messageId)
    },
    [isMounted],
  )

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
