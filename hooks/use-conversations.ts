"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useAuth } from "@clerk/nextjs"
import { createConversation as apiCreateConversation, getConversations, deleteConversation as apiDeleteConversation } from "@/lib/api"
import { toast } from "sonner"

interface Conversation {
  _id: string
  title: string
  userId: string
  createdAt: string
  updatedAt: string
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const isMountedRef = useRef(false)
  const { getToken } = useAuth()

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const refreshConversations = useCallback(async () => {
    if (!isMountedRef.current) return

    setIsLoading(true)
    try {
      const token = await getToken()
      if (token && isMountedRef.current) {
        const data = await getConversations(token)
        if (isMountedRef.current) {
          setConversations(data)
        }
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error)
      if (isMountedRef.current) {
        toast.error("Failed to fetch conversations")
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [getToken])

  const createConversation = useCallback(
    async (title: string) => {
      if (!isMountedRef.current) throw new Error("Component not mounted")

      try {
        const token = await getToken()
        if (!token) {
          const error = "No authentication token available"
          if (isMountedRef.current) {
            toast.error(error)
          }
          throw new Error(error)
        }

        console.log("[v0] Creating conversation with token:", token ? "present" : "missing")
        const conversation = await apiCreateConversation(title, token)

        if (isMountedRef.current) {
          setConversations((prev) => [conversation, ...prev])
          toast.success("Conversation created successfully")
        }
        return conversation
      } catch (error) {
        console.error("[v0] Create conversation error:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to create conversation"
        if (isMountedRef.current) {
          toast.error(errorMessage)
        }
        throw error
      }
    },
    [getToken],
  )

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (!isMountedRef.current) return;

      try {
        const token = await getToken();
        if (!token) {
          toast.error("No authentication token available");
          throw new Error("No authentication token available");
        }

        await apiDeleteConversation(conversationId, token);

        if (isMountedRef.current) {
          console.log('Before delete:', conversations);
          setConversations((prev) => prev.filter((c) => c._id !== conversationId));
          console.log('After delete:', conversations);
          toast.success("Conversation deleted successfully");
        }
      } catch (error) {
        console.error("Failed to delete conversation:", error);
        if (isMountedRef.current) {
          toast.error("Failed to delete conversation");
        }
      }
    },
    [getToken, conversations],
  );

  const updateConversation = useCallback((updatedConversation: Conversation) => {
    if (!isMountedRef.current) return;

    setConversations((prev) =>
      prev.map((c) => (c._id === updatedConversation._id ? updatedConversation : c))
    );
  }, []);

  return {
    conversations,
    isLoading,
    refreshConversations,
    createConversation,
    deleteConversation,
    updateConversation,
  }
}
