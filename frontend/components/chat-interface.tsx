"use client";

import { useState, useEffect, useRef } from "react";
import { useConversations } from "@/hooks/use-conversations";
import { useMessages } from "@/hooks/use-messages";
import { Sidebar } from "@/components/sidebar";
import { ChatArea } from "@/components/chat-area";
import { Conversation, Message as DbMessage } from "@/lib/types";
import { useChat, UIMessage as AiSdkMessage } from "@ai-sdk/react";
import { toast } from "sonner";

interface CustomFile {
  url: string;
  mimeType: string;
}

interface CustomMessage extends AiSdkMessage {
  isLoading?: boolean;
  createdAt?: Date;
  files?: CustomFile[];
  pending?: boolean;
}

export function ChatInterface() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

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

  const { messages, setMessages } = useChat();

useEffect(() => {
  if (!selectedConversation || !historyMessages) return;

  setMessages((prev) => {
    // Convert DB messages to UI messages
    const dbMessagesAsUiMessages: CustomMessage[] = historyMessages.map(
      (m) => ({
        id: m._id,
        role: m.sender === "user" ? "user" : "assistant",
        content: m.content,
        createdAt: new Date(m.createdAt),
        isLoading: false,
        files: m.files || [],
      })
    );

    // Keep any local pending messages (not in DB yet)
    const pending = prev.filter(
      (m) => !dbMessagesAsUiMessages.some((dbM) => dbM.id === m.id)
    );

    return [...dbMessagesAsUiMessages, ...pending];
  });
}, [historyMessages, selectedConversation, setMessages]);




  const handleFileUpload = (files: File[]) => {
    setFilesToUpload((prev) => [...prev, ...files]);
    const filePreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      mimeType: file.type,
    }));

    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.role === "user" && lastMessage?.pending) {
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            files: [...(lastMessage.files || []), ...filePreviews],
          },
        ];
      }
      return [
        ...prev,
        {
          id: "temp-" + Date.now(),
          role: "user",
          content: "",
          files: filePreviews,
          pending: true,
        },
      ];
    });
  };

  const handleSendMessage = async (content: string) => {
    let conversationId = selectedConversation?._id;
    let isNewConversation = false;

    if (!conversationId) {
      const newConv = await createConversation("New Chat");
      if (!newConv) {
        toast.error("Failed to create conversation");
        return;
      }
      setSelectedConversation(newConv);
      isNewConversation = true;
      conversationId = newConv._id;
      await refreshConversations();
    }

    setIsWaitingForResponse(true);

    const tempId = "temp-" + Date.now();
    const userMessage: CustomMessage = {
      id: tempId,
      role: "user",
      content,
      files: filesToUpload.map(f => ({ url: URL.createObjectURL(f), mimeType: f.type })),
      pending: true,
    };
    setMessages((prev) => [...prev, userMessage]);

    const formData = new FormData();
    formData.append("content", content);
    formData.append("sender", "user");
    filesToUpload.forEach((file) => {
      formData.append("files", file);
    });
    setFilesToUpload([]);

    try {
      const response = await fetch(`/api/v1/chat/${conversationId}/message`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to send message." }));
        throw new Error(errorData.error);
      }

      const result = await response.json();
      const assistantContent = result.content;
      const assistantId = result.id || crypto.randomUUID();

       setMessages((prev) => [
        ...prev.filter(m => m.id !== tempId), // remove temp user message
         { ...userMessage, id: result.userMessageId || tempId, pending: false }, // update user message with real id
        { id: assistantId, role: "assistant", content: assistantContent, isLoading: false }
      ]);

        // if(isNewConversation){
        //   await refreshConversations();
        //   setSelectedConversation({ ...result.conversation });
        // }

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsWaitingForResponse(false);
      await refreshConversations(); 
      await refreshMessages();
    }
  };

  useEffect(() => {
    refreshConversations();
  }, []);

  const handleNewConversation = async () => {
    setSelectedConversation(null);
    setMessages([]);
    await refreshConversations();
  };


  const handleDeleteConversation = async (id: string) => {
    await deleteConversationFromHook(id);
    if (selectedConversation?._id === id) {
      setSelectedConversation(null);
    }
    refreshConversations();
  };

  const displayedMessages: DbMessage[] = messages.map((m: CustomMessage) => ({
    _id: m.id,
    conversationId: selectedConversation?._id ?? "",
    sender: m.role === "user" ? "user" : "assistant",
    content: m.content,
    isLoading: m.isLoading,
    createdAt: m.createdAt?.toISOString() ?? new Date().toISOString(),
    files: m.files || [],
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
        onToggle={() => setIsSidebarOpen(true)}
      />

      {process.env.NODE_ENV === "development" && (
        <pre className="text-xs text-white p-2 bg-black/50 fixed bottom-0 right-0 z-50">
          {JSON.stringify(
            {
              selectedConversation,
              messages: messages.length,
              historyMessages: historyMessages?.length,
              isWaitingForResponse,
            },
            null,
            2
          )}
        </pre>
      )}

      <div className="flex-1 flex flex-col relative">
        <ChatArea
          scrollRef={scrollContainerRef}
          conversationId={selectedConversation?._id ?? null}
          messages={displayedMessages}
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
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