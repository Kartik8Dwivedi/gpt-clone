"use client"

import { useAuth } from "@clerk/nextjs"
import { ChatInterface } from "@/components/chat-interface"
import { AuthScreen } from "@/components/auth-screen"

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <AuthScreen />
  }

  return <ChatInterface />
}
