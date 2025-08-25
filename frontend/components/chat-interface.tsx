"use client";

import { useState, useEffect } from "react";
import { useConversations } from "@/hooks/use-conversations";
import { useMessages } from "@/hooks/use-messages";
import { Sidebar } from "@/components/sidebar";
import { ChatArea } from "@/components/chat-area";
import { Conversation, Message as DbMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { useChat, Message as AiSdkMessage } from "@ai-sdk/react";
import { toast } from "sonner";

interface CustomMessage extends AiSdkMessage {
  isLoading?: boolean;
}

export function ChatInterface() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const {
    conversations,
    refreshConversations,
    createConversation,
    deleteConversation: deleteConversationFromHook,
  } = useConversations();

  const {
    messages: historyMessages,
    refreshMessages,
    editMessage,
    deleteMessage,
    regenerateMessage,
  } = useMessages(selectedConversation?._id);

  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    isLoading,
    stop,
  } = useChat({ onFinish: refreshMessages });

  useEffect(() => {
    if (selectedConversation) {
      const dbMessagesAsUiMessages: CustomMessage[] = historyMessages.map((m) => ({
        id: m._id,
        role: m.sender === "user" ? "user" : "assistant",
        content: m.content,
        createdAt: new Date(m.createdAt),
        isLoading: false, // Ensure initial messages are not loading
      }));
      setMessages(dbMessagesAsUiMessages);
    } else {
      setMessages([]);
    }
  }, [historyMessages, selectedConversation, setMessages]);

  const handleSendMessage = async (content: string, files?: string[]) => {
    let conversationId = selectedConversation?._id;

    if (!conversationId) {
      const newConv = await createConversation("New Chat");
      if (!newConv) {
        console.error("Failed to create conversation");
        return;
      }
      setSelectedConversation(newConv);
      conversationId = newConv._id;
    }

    const userMessage: CustomMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    
    // Functional update for user message
    setMessages((prevMessages: CustomMessage[]) => [...prevMessages, userMessage]);

    const response = await fetch(`/api/v1/chat/${conversationId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, files, sender: "user" }), // Explicitly send sender as user
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error saving user message:", errorData);
      toast.error(errorData.error || "Failed to send message.");
      // Remove the user message from the UI if saving failed
      setMessages((prevMessages: CustomMessage[]) => prevMessages.filter(m => m.id !== userMessage.id));
      return;
    }
    if (!response.body) {
      console.error("Response has no body");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let streamedContent = "";
    const assistantId = crypto.randomUUID();

    // Functional update for empty assistant message with isLoading: true
    setMessages((prevMessages: CustomMessage[]) => [
      ...prevMessages,
      { id: assistantId, role: "assistant", content: "", isLoading: true },
    ]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // When streaming is done, set isLoading to false for this message
        setMessages((prevMessages: CustomMessage[]) =>
          prevMessages.map((m) =>
            m.id === assistantId ? { ...m, isLoading: false } : m
          )
        );
        break;
      }
      streamedContent += decoder.decode(value, { stream: true });
      // Functional update for streaming content
      setMessages((prevMessages: CustomMessage[]) =>
        prevMessages.map((m) =>
          m.id === assistantId ? { ...m, content: streamedContent } : m
        )
      );
    }

    // Save assistant message to backend after streaming
    await fetch(`/api/v1/chat/${conversationId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: streamedContent, sender: "assistant" }),
    });

    refreshMessages();
  };

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const handleNewConversation = async () => {
    const newConv = await createConversation("New Chat");
    setSelectedConversation(newConv);
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteConversationFromHook(id);
    if (selectedConversation?._id === id) {
      setSelectedConversation(null);
    }
  };

  const displayedMessages: DbMessage[] = messages.map((m: CustomMessage) => ({
    _id: m.id,
    conversationId: selectedConversation?._id ?? "",
    sender: m.role === "user" ? "user" : "assistant",
    content: m.content,
    isLoading: m.isLoading, // Use m.isLoading directly
    createdAt: m.createdAt?.toISOString() ?? new Date().toISOString(),
  }));

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        conversations={conversations}
        activeConversationId={selectedConversation?._id ?? null}
        onSelectConversation={(id) => {
          const conv = conversations.find((c) => c._id === id) ?? null;
          setSelectedConversation(conv);
        }}
        onNewConversation={handleNewConversation}
        deleteConversation={handleDeleteConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col relative">
        {!isSidebarOpen && (
          <Button
            onClick={() => setIsSidebarOpen(true)}
            variant="ghost"
            size="icon"
            className="fixed top-3 left-3 z-50 text-[#b4b4b4] hover:text-white hover:bg-[#2f2f2f]"
          >
            <PanelLeft className="w-5 h-5" />
          </Button>
        )}

        <ChatArea
          conversationId={selectedConversation?._id ?? null}
          messages={displayedMessages}
          isLoading={isLoading}
          input={input}
          onInputChange={handleInputChange}
          onSendMessage={handleSendMessage}
          onEditMessage={editMessage}
          onDeleteMessage={deleteMessage}
          onRegenerateMessage={regenerateMessage}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
    </div>
  );
}