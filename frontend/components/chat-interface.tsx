"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useConversations } from "@/hooks/use-conversations";
import { useMessages } from "@/hooks/use-messages";
import { Sidebar } from "@/components/sidebar";
import { ChatArea } from "@/components/chat-area";
import { Conversation } from "@/lib/types";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";

export function ChatInterface() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { getToken } = useAuth();
  const {
    conversations,
    isLoading: isLoadingConversations,
    refreshConversations,
    createConversation,
    deleteConversation: deleteConversationFromHook,
    updateConversation,
  } = useConversations();
  const {
    messages,
    isLoading: isLoadingMessages,
    setMessages,
    refreshMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    regenerateMessage,
  } = useMessages(selectedConversation?._id);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleNewConversation = () => {
    setSelectedConversation(null);
  };

  const handleSendMessage = async (content: string, files?: string[]) => {
    let conversationId = selectedConversation?._id;

    if (!conversationId) {
      const newConversation = await createConversation("New Chat");
      setSelectedConversation(newConversation);
      conversationId = newConversation._id;
    }

    const updatedConversation = await sendMessage(content, files, conversationId);
    if (updatedConversation) {
      updateConversation(updatedConversation);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    await deleteConversationFromHook(conversationId);
    if (selectedConversation?._id === conversationId) {
      setSelectedConversation(null);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={selectedConversation?._id ?? null}
        onSelectConversation={(id) => {
          const conv = conversations.find((c) => c._id === id) || null;
          setSelectedConversation(conv);
        }}
        onNewConversation={handleNewConversation}
        deleteConversation={handleDeleteConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Toggle button (only visible when sidebar is closed) */}
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

        {/* ChatArea always visible */}
        <ChatArea
          conversationId={selectedConversation?._id ?? null}
          messages={messages}
          isLoading={isLoadingMessages}
          onSendMessage={handleSendMessage}
          onEditMessage={editMessage}
          onDeleteMessage={deleteMessage}
          onRegenerateMessage={regenerateMessage}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
      

      {/* <Toaster /> */}
    </div>
  );
}
