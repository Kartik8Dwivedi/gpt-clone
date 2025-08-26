import { Dispatch, SetStateAction } from "react";

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

export async function streamAssistantResponse(
  response: Response,
  conversationId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  refreshMessages: () => Promise<void>
) {
  if (!response.ok || !response.body) {
    throw new Error(`Stream failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const tempId = `stream_${Date.now()}`;

  // Add a placeholder message that will be updated as the stream comes in
  setMessages((prev) => [
    ...prev,
    {
      _id: tempId,
      conversationId,
      sender: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      isLoading: true,
    },
  ]);

  let content = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      content += decoder.decode(value, { stream: true });
      // Update the placeholder message with the new content
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, content } : m))
      );
    }
  } catch (error) {
    console.error("Error while streaming response:", error);
    // On error, remove the temporary message
    setMessages((prev) => prev.filter((m) => m._id !== tempId));
    return; // Stop execution on error
  }

  // Final update to mark the streaming as complete
  setMessages((prev) =>
    prev.map((m) => (m._id === tempId ? { ...m, isLoading: false } : m))
  );

  // Refresh the messages from the database to get the final, persisted message
  await refreshMessages();
}

