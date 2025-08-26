"use client"

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL
  ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1`
  : "http://localhost:3001/api/v1"

// Auth API
export async function syncUser(user: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/auth/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: user.id,
      emailAddresses: user.emailAddresses,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to sync user")
  }

  return response.json()
}

// Chat API
export async function createConversation(title: string, token: string) {
  console.log("[v0] Creating conversation with title:", title)
  console.log("[v0] API_BASE_URL:", API_BASE_URL)

  try {
    const response = await fetch(`${API_BASE_URL}/chat/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    })

    console.log("[v0] Create conversation response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Create conversation error:", errorText)
      throw new Error(`Failed to create conversation: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log("[v0] Create conversation success:", result)
    return result.data
  } catch (error) {
    console.error("[v0] Create conversation catch error:", error)
    throw error
  }
}

export async function getConversations(token: string) {
  const response = await fetch(`${API_BASE_URL}/chat/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch conversations")
  }

  const result = await response.json()
  return result.data
}

export async function getMessages(conversationId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/chat/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch messages")
  }

  const result = await response.json()
  return result.data
}

export async function sendMessage(conversationId: string, content: string, files: string[], token: string) {
  console.log("[v0] Sending message to conversation:", conversationId)
  console.log("[v0] Message content:", content)

  try {
    const response = await fetch(`${API_BASE_URL}/chat/${conversationId}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, files }),
    })

    console.log("[v0] Send message response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Send message error:", errorText)
      throw new Error(`Failed to send message: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log("[v0] Send message success:", result)

    return result.data
  } catch (error) {
    console.error("[v0] Send message catch error:", error)
    throw error
  }
}

export async function editMessage(conversationId: string, messageId: string, content: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/chat/${conversationId}/message/${messageId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    throw new Error("Failed to edit message")
  }

  const result = await response.json()
  return result.data
}

export async function deleteMessage(conversationId: string, messageId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/chat/${conversationId}/message/${messageId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to delete message")
  }

  return response.json()
}

export async function deleteConversation(conversationId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/chat/${conversationId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete conversation');
    }

    return response.json();
}

export async function regenerateMessage(conversationId: string, messageId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/chat/${conversationId}/message/${messageId}/regenerate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to regenerate message');
    }

    return response;
}

// File API
export async function uploadFile(file: File, token: string) {
  // TODO: Implement Uploadcare integration
  // For now, return mock response
  return {
    _id: `file_${Date.now()}`,
    url: "https://example.com/file.png",
    type: file.type,
    size: file.size,
  }
}

// Memory API
export async function addMemory(conversationId: string, key: string, value: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/memory/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ conversationId, key, value }),
  })

  if (!response.ok) {
    throw new Error("Failed to add memory")
  }

  const result = await response.json()
  return result.data
}

export async function getUserMemory(token: string) {
  const response = await fetch(`${API_BASE_URL}/memory/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch user memory")
  }

  const result = await response.json()
  return result.data
}

export async function getConversationMemory(conversationId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/memory/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch conversation memory")
  }

  const result = await response.json()
  return result.data
}
