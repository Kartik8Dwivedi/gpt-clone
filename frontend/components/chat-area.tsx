"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Menu, Send, ArrowDown, ArrowUp, Paperclip } from "lucide-react";
import { MessageBubble } from "@/components/message-bubble";

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
  const [uploadedFiles, setUploadedFiles] = useState<
    { id: string; name: string; url: string; status: string }[]
  >([]);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SCROLL_THRESHOLD = 120;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const previews = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
      status: "uploading",
    }));

    setUploadedFiles((prev) => [...prev, ...previews]);

    try {
      const uploadResults = await Promise.all(
        files.map(async (file, i) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append(
            "upload_preset",
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
          );

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
            { method: "POST", body: formData }
          );
          const data = await res.json();

          return {
            id: previews[i].id,
            name: file.name,
            url: data.secure_url,
            status: "done",
          };
        })
      );

      setUploadedFiles((prev) =>
        prev.map((f) => uploadResults.find((u) => u.id === f.id) || f)
      );
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      setUploadedFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: f.status === "uploading" ? "error" : f.status,
        }))
      );
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior,
    });
  };

  const scrollToTop = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  useEffect(() => {
    if (!autoScroll) return;
    const id = requestAnimationFrame(() => scrollToBottom("auto"));
    return () => cancelAnimationFrame(id);
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    const atBottom = distanceFromBottom < SCROLL_THRESHOLD;
    setShowScrollToBottom(!atBottom);
    setAutoScroll(atBottom);
  };

  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;
    setIsLoading(true);
    try {
      setAutoScroll(true);
      await onSendMessage(
        input,
        uploadedFiles.filter((f) => f.status === "done").map((f) => f.url)
      );
      setInput("");
      setUploadedFiles([]);
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

  const handleSaveEdit = async (messageId: string, content: string) => {
    setEditingMessageId(null);
    await onEditMessage(messageId, content);
    await onSendMessage(content);
  };

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
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFileButtonClick}
                  className="mb-1 text-[#8e8ea0] hover:text-white hover:bg-[#565869] rounded-full flex justify-center items-center"
                >
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
                    onClick={() => handleSaveEdit(m._id, editContent)}
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

      {uploadedFiles.length > 0 && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap max-w-3xl mx-auto">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 bg-[#2f2f2f] text-white px-3 py-1 rounded-lg text-sm"
            >
              {file.name}
              {file.status === "uploading" && (
                <span className="text-yellow-400">⏳</span>
              )}
              {file.status === "done" && (
                <span className="text-green-400">✔</span>
              )}
              {file.status === "error" && (
                <span className="text-red-400">✖</span>
              )}
            </div>
          ))}
        </div>
      )}

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
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFileButtonClick}
              className="mb-1 text-[#8e8ea0] hover:text-white hover:bg-[#565869] rounded-full flex justify-center items-center"
            >
              <Paperclip className="w-4 h-4" />
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
