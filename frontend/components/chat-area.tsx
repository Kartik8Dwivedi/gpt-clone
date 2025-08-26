"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Menu, Send, Mic, ArrowDown, ArrowUp, Paperclip } from "lucide-react";
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
  isLoading?: boolean;
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
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // NEW: control when we auto-scroll to bottom
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SCROLL_THRESHOLD = 120; // px from bottom considered "at bottom"

  

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior,
    });
  };

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  // Auto-scroll only if user is near the bottom or hasn't scrolled up
  useEffect(() => {
    if (!autoScroll) return;
    // Use rAF so layout is updated before we scroll
    const id = requestAnimationFrame(() => scrollToBottom("auto"));
    return () => cancelAnimationFrame(id);
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    const atBottom = distanceFromBottom < SCROLL_THRESHOLD;
    setShowScrollToBottom(!atBottom);
    setAutoScroll(atBottom); // if user scrolls up, disable auto-scroll; re-enable when back near bottom
  };

  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;
    setIsLoading(true);
    try {
      setAutoScroll(true); // ensure we follow the stream
      await onSendMessage(input, uploadedFiles);
      setInput("");
      setUploadedFiles([]);
      // snap to bottom once send completes (avoid fight with smooth scroll)
      scrollToBottom("auto");
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

  // Determine last assistant message id (prefer an assistant message with isLoading === true)
  const lastAssistantLoading = [...messages]
    .slice()
    .reverse()
    .find((m) => m.sender === "assistant" && m.isLoading);
  const lastAssistant =
    lastAssistantLoading ??
    [...messages]
      .slice()
      .reverse()
      .find((m) => m.sender === "assistant");
  const lastAssistantId = lastAssistant
    ? lastAssistant._id
    : isLoading
    ? "__placeholder__"
    : null;

  // Empty conversation state
  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col bg-[#212121]">
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

        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center space-y-8">
            <h1 className="text-3xl font-medium text-white">
              What’s on your mind today?
            </h1>

            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className="min-h-[60px] bg-[#303030] border-[#212121] text-white placeholder-[#8e8ea0] resize-none rounded-full pl-6 pr-20 border-2 shadow-lg placeholder:text-base placeholder:opacity-60 text-base pt-4"
                disabled={isLoading}
              />

              <div className="absolute bottom-3 right-4 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 pt-1 text-[#8e8ea0] hover:text-white hover:bg-[#565869]"
                >
                  {/* Paperclip removed in this minimal header state to keep parity */}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-1 text-[#8e8ea0] hover:text-white hover:bg-[#565869] rounded-full flex justify-center items-center"
                >
                  {/* <Mic className="w-4 h-4" /> */}
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 h-full w-full mb-1 rounded-full transition-colors ${
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

          <div className="absolute bottom-4 text-center text-sm text-[#8e8ea0]">
            ChatGPT can make mistakes. Check important info.
          </div>
        </div>
      </div>
    );
  }

  // Active conversation
  return (
    <div className="flex-1 flex flex-col bg-[#212121] h-full">
      <div
        className="flex-1 overflow-y-auto"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto space-y-6 p-4">
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
                isLastMessage={m._id === lastAssistantId}
                onEdit={() => handleEditStart(m)}
                onDelete={() => onDeleteMessage(m._id)}
                onRegenerate={() => onRegenerateMessage(m._id)}
              />
            )
          )}

          {/* If local isLoading (sending) and there isn't already a message with isLoading, render a placeholder bubble */}
          {isLoading && !messages.some((mm) => mm.isLoading) && (
            <MessageBubble
              message={{
                _id: "__placeholder__",
                conversationId: conversationId || "",
                sender: "assistant",
                content: "",
                createdAt: new Date().toISOString(),
                isLoading: true,
              }}
              isLastMessage={lastAssistantId === "__placeholder__"}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {showScrollToBottom && (
        <Button
          onClick={() => {
            scrollToBottom();
            setAutoScroll(true);
          }}
          variant="outline"
          size="icon"
          className="absolute bottom-24 right-10 z-50 rounded-full bg-background border-2 border-primary text-primary"
        >
          <ArrowDown className="w-5 h-5" />
        </Button>
      )}
      {!showScrollToBottom && messages.length > 5 && (
        <Button
          onClick={scrollToTop}
          variant="outline"
          size="icon"
          className="absolute bottom-24 right-10 z-50 rounded-full bg-background border-2 border-primary text-primary"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}

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

        <p className="mt-2 text-center text-xs text-[#8e8ea0]">
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
