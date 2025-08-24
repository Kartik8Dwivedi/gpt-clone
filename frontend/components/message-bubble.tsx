"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Bot,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

interface MessageBubbleProps {
  message: Message;
  onEdit?: () => void;
  onDelete?: () => void;
  onRegenerate?: () => void;
}

/* ----------------------- */
/* Code block renderer     */
/* ----------------------- */
function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group my-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCopy}
        className="absolute right-2 top-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition"
      >
        <Copy className="h-3 w-3" />
      </Button>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        PreTag="div"
        customStyle={{
          borderRadius: "0.5rem",
          padding: "1rem",
          fontSize: "0.875rem",
        }}
      >
        {value}
      </SyntaxHighlighter>
      {copied && (
        <span className="absolute right-2 top-10 text-xs text-green-500">
          Copied!
        </span>
      )}
    </div>
  );
}

/* ----------------------- */
/* Main bubble component   */
/* ----------------------- */
export function MessageBubble({
  message,
  onEdit,
  onDelete,
  onRegenerate,
}: MessageBubbleProps) {
  const isUser = message.sender === "user";
  const [feedback, setFeedback] = useState<"liked" | "disliked" | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [displayedContent, setDisplayedContent] = useState("");

  useEffect(() => {
    console.log("message: ", message)
    if (
      message.sender === 'assistant' && 
      message.isLoading
    ) {
      setDisplayedContent("");
    } else if (
      message.sender === "assistant" &&
      !message.isLoading &&
      new Date().getTime() - new Date(message.createdAt).getTime() < 5000
    ) {
      const words = message.content.split(" ");
      let currentContent = "";
      let wordIndex = 0;
      const interval = setInterval(() => {
        if (wordIndex < words.length) {
          currentContent += (wordIndex > 0 ? " " : "") + words[wordIndex];
          setDisplayedContent(currentContent);
          wordIndex++;
        } else {
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      setDisplayedContent(message.content);
    }
  }, [message.content, message.sender, message.isLoading]);

  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoices(speechSynthesis.getVoices());
    };
    speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      speechSynthesis.cancel();
    };
  }, []);

  const handleFeedback = (type: "liked" | "disliked") => {
    if (feedback === type) {
      setFeedback(null);
    } else {
      setFeedback(type);
      toast.success("Feedback submitted!");
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (voices.length === 0) {
        toast.error("No voices available for speech synthesis.");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.voice = voices[0]; // Use the first available voice
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast.error("Could not play audio.");
      };
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "w-full px-4 py-6 flex",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "max-w-3xl",
            isUser
              ? "bg-primary text-primary-foreground rounded-2xl px-4 py-2"
              : "prose prose-sm text-foreground max-w-none"
          )}
        >
          {/* Loading animation */}
          {message.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <CodeBlock
                      language={match[1]}
                      value={String(children).replace(/\n$/, "")}
                    />
                  ) : (
                    <code
                      className="bg-muted px-1 py-0.5 rounded text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {displayedContent}
            </ReactMarkdown>
          )}

          {/* Actions under assistant messages */}
          {!isUser && !message.isLoading && (
            <div className="flex gap-2 mt-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFeedback("liked")}
                    className={cn("h-6 w-6 p-0", feedback === "liked" && "text-blue-500")}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Like</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFeedback("disliked")}
                    className={cn("h-6 w-6 p-0", feedback === "disliked" && "text-red-500")}
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Dislike</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSpeak}
                    className={cn("h-6 w-6 p-0", isSpeaking && "text-green-500")}
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Read aloud</TooltipContent>
              </Tooltip>
              {onRegenerate && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onRegenerate}
                      className="h-6 w-6 p-0"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Regenerate</TooltipContent>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onDelete}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* Actions for user messages */}
          {isUser && (
            <div className="flex justify-end gap-2 mt-1">
              {onEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onEdit}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onDelete}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}