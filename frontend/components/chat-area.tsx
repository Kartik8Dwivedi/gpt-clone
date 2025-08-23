"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, Send, X, Paperclip, Mic } from "lucide-react";
import { MessageBubble } from "@/components/message-bubble";
import { FileUpload } from "@/components/file-upload";

interface Message {
  _id: string;
  conversationId: string;
  sender: "user" | "assistant";
  content: string;
  files?: string[];
  createdAt: string;
  edited?: boolean;
}

interface ChatAreaProps {
  conversationId: string | null;
  messages: Message[];
  onSendMessage: (content: string, files?: string[]) => Promise<void>;
  onEditMessage: (messageId: string, content: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onRegenerateMessage: (messageId: string) => Promise<void>;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ChatArea({
  conversationId,
  messages,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onRegenerateMessage,
  isSidebarOpen,
  onToggleSidebar,
}: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;
    setIsLoading(true);
    try {
      await onSendMessage(input, uploadedFiles);
      setInput("");
      setUploadedFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEditStart = (message: Message) => {
    setEditingMessageId(message._id);
    setEditContent(message.content);
  };

  const handleFileUpload = (fileIds: string[]) => {
    setUploadedFiles((prev) => [...prev, ...fileIds]);
  };

  // ----------------------------
  // Empty conversation state
  // ----------------------------
  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col bg-[#212121]">
        {/* Top bar with menu toggle when sidebar closed */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2f2f2f]">
          {!isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="p-2 text-[#b4b4b4] hover:text-white hover:bg-[#2f2f2f]"
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}
          <span className="text-white font-medium">ChatGPT</span>
          <Button className="bg-[#10a37f] hover:bg-[#0d8f6b] text-white px-4 py-1.5 rounded-full text-sm">
            Upgrade
          </Button>
        </div>

        {/* Centered welcome content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center space-y-8">
            <h1 className="text-3xl font-medium text-white">
              What’s on your mind today?
            </h1>

            {/* Input */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className="min-h-[60px] bg-[#303030] border-[#212121] text-white placeholder-[#8e8ea0] resize-none rounded-full pl-6 pr-20 border-2 shadow-lg placeholder:text-base placeholder:opacity-60 placeholder:pt-2"
                disabled={isLoading}
              />
              <div className="absolute bottom-3 right-4 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-[#8e8ea0] hover:text-white hover:bg-[#565869]"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-[#8e8ea0] hover:text-white hover:bg-[#565869]"
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-lg transition-colors ${
                    input.trim()
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-[#565869] text-[#8e8ea0] cursor-not-allowed"
                  }`}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="absolute bottom-4 text-center text-sm text-[#8e8ea0]">
            ChatGPT can make mistakes. Check important info.
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------
  // Active conversation
  // ----------------------------
  return (
    <div className="flex-1 flex flex-col bg-[#212121]">
      {/* Scrollable messages */}
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((m) =>
            editingMessageId === m._id ? (
              <div key={m._id} className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px] bg-[#40414f] border-[#4a4a4a] text-white"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onEditMessage(m._id, editContent)}
                    className="bg-[#10a37f] hover:bg-[#0d8f6b] text-white"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingMessageId(null)}
                    className="border-[#4a4a4a] text-white hover:bg-[#2f2f2f] bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <MessageBubble
                key={m._id}
                message={m}
                onEdit={() => handleEditStart(m)}
                onDelete={() => onDeleteMessage(m._id)}
                onRegenerate={() => onRegenerateMessage(m._id)}
              />
            )
          )}

          {isLoading && (
            <MessageBubble
              message={{
                _id: "loading",
                conversationId,
                sender: "assistant",
                content: "",
                createdAt: new Date().toISOString(),
              }}
              isLoading
            />
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-[#3B3C49]">
        <div className="max-w-3xl mx-auto relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            className="min-h-[60px] bg-[#303030] border-[#4a4a4a] text-white placeholder-[#303030] resize-none rounded-3xl pl-6 pr-20"
            disabled={isLoading}
          />
          <div className="absolute bottom-3 right-4 flex items-center gap-2">
            <FileUpload onUpload={handleFileUpload} />
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-[#8e8ea0] hover:text-white hover:bg-[#3B3C49]"
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={
                (!input.trim() && uploadedFiles.length === 0) || isLoading
              }
              className={`p-2 rounded-lg transition-colors ${
                (input.trim() || uploadedFiles.length > 0) && !isLoading
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-[#565869] text-[#8e8ea0] cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-2 text-center text-xs text-[#8e8ea0]">
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
