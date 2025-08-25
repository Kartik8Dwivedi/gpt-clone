"use client";

import { useState, useEffect, useRef } from "react";
import { useConversations } from "@/hooks/use-conversations";
import { useMessages } from "@/hooks/use-messages";
import { Sidebar } from "@/components/sidebar";
import { ChatArea } from "@/components/chat-area";
import { Conversation, Message as DbMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { useChat, UIMessage as AiSdkMessage } from "@ai-sdk/react";
import { toast } from "sonner";

interface CustomMessage extends AiSdkMessage {
  isLoading?: boolean;
  createdAt?: Date;
}

export function ChatInterface() {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);

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

  const { messages, setMessages } = useChat({ onFinish: refreshMessages });

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    if (isStreaming) return;

    if (historyMessages === undefined || historyMessages === null) {
      return; 
    }

    const dbMessagesAsUiMessages: CustomMessage[] = historyMessages.map((m) => ({
      id: m._id,
      role: m.sender === "user" ? "user" : "assistant",
      content: m.content,
      createdAt: new Date(m.createdAt),
      isLoading: false,
    }));

    setMessages(dbMessagesAsUiMessages);
  }, [historyMessages, selectedConversation, setMessages, isStreaming]);


  // const handleSendMessage = async (content: string, files?: string[]) => {
  //   let conversationId = selectedConversation?._id;

  //   if (!conversationId) {
  //     const newConv = await createConversation("New Chat");
  //     if (!newConv) {
  //       console.error("Failed to create conversation");
  //       return;
  //     }
  //     setSelectedConversation(newConv);
  //     conversationId = newConv._id;
  //     refreshConversations();
  //   }

  //   const userMessage: CustomMessage = {
  //     id: crypto.randomUUID(),
  //     role: "user",
  //     content,
  //   };
  //   setMessages((prev: CustomMessage[]) => [...prev, userMessage]);

  //   const response = await fetch(`/api/v1/chat/${conversationId}/message`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ content, files, sender: "user" }),
  //   });

  //   if (!response.ok) {
  //     const errorData = await response.json();
  //     console.error("Error saving user message:", errorData);
  //     toast.error(errorData.error || "Failed to send message.");
  //     setMessages((prev: CustomMessage[]) =>
  //       prev.filter((m) => m.id !== userMessage.id)
  //     );
  //     return;
  //   }
  //   if (!response.body) {
  //     console.error("Response has no body");
  //     return;
  //   }

  //   const reader = response.body.getReader();
  //   const decoder = new TextDecoder();
  //   const assistantId = crypto.randomUUID();

  //   setIsStreaming(true);

  //   // Add a placeholder assistant message
  //   setMessages((prev: CustomMessage[]) => [
  //     ...prev,
  //     { id: assistantId, role: "assistant", content: "", isLoading: true },
  //   ]);

  //   try {
  //     let buffer = "";
  //     let typingInterval: NodeJS.Timeout | null = null;
  //     let fullResponse = "";

  //     while (true) {
  //       const { done, value } = await reader.read();

  //       // If stream done
  //       if (done) {
  //         // stop interval if running
  //         if (typingInterval) {
  //           clearInterval(typingInterval);
  //           typingInterval = null;
  //         }

  //         // flush any remaining buffered chars into UI & fullResponse
  //         if (buffer.length > 0) {
  //           const remaining = buffer;
  //           buffer = "";

  //           setMessages((prev: CustomMessage[]) =>
  //             prev.map((m) =>
  //               m.id === assistantId
  //                 ? { ...m, content: (m.content || "") + remaining }
  //                 : m
  //             )
  //           );
  //           fullResponse += remaining;
  //         }

  //         // mark assistant message finished loading in UI
  //         setMessages((prev: CustomMessage[]) =>
  //           prev.map((m) =>
  //             m.id === assistantId ? { ...m, isLoading: false } : m
  //           )
  //         );

  //         // Save final assembled assistant message once (only once)
  //         try {
  //           const saveResp = await fetch(
  //             `/api/v1/chat/${conversationId}/message`,
  //             {
  //               method: "POST",
  //               headers: { "Content-Type": "application/json" },
  //               body: JSON.stringify({
  //                 sender: "assistant",
  //                 content: fullResponse,
  //               }),
  //             }
  //           );

  //           if (!saveResp.ok) {
  //             const errJson = await saveResp.json().catch(() => null);
  //             console.error("Failed to save assistant message", errJson);
  //           }
  //         } catch (err) {
  //           console.error("Error saving assistant message:", err);
  //         }

  //         break;
  //       }

  //       // decode chunk and append to buffer
  //       const chunkText = decoder.decode(value, { stream: true });
  //       buffer += chunkText;

  //       // start interval if not started
  //       if (!typingInterval) {
  //         typingInterval = setInterval(() => {
  //           if (buffer.length === 0) return;

  //           const nextChar = buffer[0];
  //           buffer = buffer.slice(1);
  //           fullResponse += nextChar;

  //           // append single char to UI message
  //           setMessages((prev: CustomMessage[]) =>
  //             prev.map((m) =>
  //               m.id === assistantId
  //                 ? { ...m, content: (m.content || "") + nextChar }
  //                 : m
  //             )
  //           );

  //           // only auto-scroll if user is near bottom
  //           const container = scrollContainerRef.current;
  //           if (container) {
  //             const isNearBottom =
  //               container.scrollHeight -
  //                 container.scrollTop -
  //                 container.clientHeight <
  //               80;
  //             if (isNearBottom) {
  //               container.scrollTop = container.scrollHeight;
  //             }
  //           }
  //         }, 25); // typing speed: ms per char
  //       }
  //     }

  //     // after stream completes, refresh server-side messages & conversations
  //     await Promise.all([refreshMessages(), refreshConversations()]);
  //   } finally {
  //     setIsStreaming(false);
  //   }
  // };


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
    refreshConversations();
  }

  // optimistic user message
  const userMessage: CustomMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content,
  };
  setMessages((prev: CustomMessage[]) => [...prev, userMessage]);

  // Tell backend to save user message & start streaming assistant
  const response = await fetch(`/api/v1/chat/${conversationId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, files, sender: "user" }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("Error saving user message:", errorData);
    toast.error(errorData?.error || "Failed to send message.");
    setMessages((prev: CustomMessage[]) =>
      prev.filter((m) => m.id !== userMessage.id)
    );
    return;
  }
  if (!response.body) {
    console.error("Response has no body");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const assistantId = crypto.randomUUID();

  setIsStreaming(true);

  // add placeholder assistant bubble
  setMessages((prev: CustomMessage[]) => [
    ...prev,
    { id: assistantId, role: "assistant", content: "", isLoading: true },
  ]);

  // typing queue & interval
  const TYPING_MS = 25; // ms per char — tweak as needed
  const charQueue: string[] = [];
  let fullResponse = "";
  let typingInterval: ReturnType<typeof setInterval> | null = null;
  let readerDone = false;

  const startTypingInterval = () => {
    if (typingInterval) return;
    typingInterval = setInterval(() => {
      if (charQueue.length === 0) {
        // if reader finished and queue empty we'll clear below
        return;
      }
      const ch = charQueue.shift()!;
      fullResponse += ch;
      setMessages((prev: CustomMessage[]) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: (m.content || "") + ch } : m
        )
      );

      const container = scrollContainerRef.current;
      if (container) {
        const isNearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          80;
        if (isNearBottom) container.scrollTop = container.scrollHeight;
      }
    }, TYPING_MS);
  };

  try {
    // read stream and enqueue chars
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        readerDone = true;
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      if (chunk.length > 0) {
        for (let i = 0; i < chunk.length; i++) charQueue.push(chunk[i]);
        startTypingInterval();
      }
    }

    // ---> IMMEDIATE FLUSH on reader done (no long wait)
    // drain the queue synchronously so UI shows full response quickly
    while (charQueue.length > 0) {
      const ch = charQueue.shift()!;
      fullResponse += ch;
      setMessages((prev: CustomMessage[]) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: (m.content || "") + ch } : m
        )
      );
    }

    // stop and clear interval if running
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }

    // mark assistant finished in UI
    setMessages((prev: CustomMessage[]) =>
      prev.map((m) => (m.id === assistantId ? { ...m, isLoading: false } : m))
    );

    // SAVE the final assistant message once
    try {
      const saveResp = await fetch(`/api/v1/chat/${conversationId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "assistant",
          content: fullResponse,
        }),
      });
      if (!saveResp.ok) {
        const errJson = await saveResp.json().catch(() => null);
        console.error("Failed to save assistant message", errJson);
      }
    } catch (err) {
      console.error("Error saving assistant message:", err);
    }

    // refresh DB-backed state & sidebar
    await Promise.all([refreshMessages(), refreshConversations()]);
  } finally {
    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }
    setIsStreaming(false);
    // after final save of assistant message
    await Promise.all([refreshMessages(), refreshConversations()]);
  }
};



  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

const handleNewConversation = async () => {
  // await createConversation("New Chat");
  refreshConversations();
  setSelectedConversation(null);
  setMessages([]);
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
          scrollRef={scrollContainerRef}
          conversationId={selectedConversation?._id ?? null}
          messages={displayedMessages}
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
