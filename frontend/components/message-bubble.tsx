"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Edit, Trash2, RotateCcw, User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  _id: string
  conversationId: string
  sender: "user" | "assistant"
  content: string
  files?: string[]
  createdAt: string
  edited?: boolean
}

interface MessageBubbleProps {
  message: Message
  onEdit?: () => void
  onDelete?: () => void
  onRegenerate?: () => void
  isLoading?: boolean
}

export function MessageBubble({ message, onEdit, onDelete, onRegenerate, isLoading = false }: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isUser = message.sender === "user"

  return (
    <div
      className={cn("group flex gap-4 p-4 rounded-lg transition-colors", isUser ? "bg-card" : "bg-muted/30")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback
          className={cn(isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">{isUser ? "You" : "ChatGPT"}</span>
          {message.edited && <span className="text-xs text-muted-foreground">(edited)</span>}
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
            </div>
            <span className="text-sm">Thinking...</span>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-foreground">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        )}

        {/* Files */}
        {message.files && message.files.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.files.map((file, index) => (
              <div key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm">
                📎 {file}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {!isLoading && (isHovered || isUser) && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isUser && onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                className="h-6 px-2 text-muted-foreground hover:text-foreground"
              >
                <Edit className="w-3 h-3" />
              </Button>
            )}

            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="h-6 px-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}

            {!isUser && onRegenerate && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRegenerate}
                className="h-6 px-2 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
