"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserButton } from "@clerk/nextjs";
import {
  Plus,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Trash2,
  Search as SearchIcon,
  Library,
  Sparkles,
  Zap,
  PanelLeftClose,
  ChevronLeft,
  Menu as MenuIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Conversation {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  deleteConversation: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  deleteConversation,
  isOpen,
  onClose,
  onToggle,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [topHover, setTopHover] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleEditStart = (conversation: Conversation) => {
    setEditingId(conversation._id);
    setEditTitle(conversation.title);
  };

  const handleEditSave = () => {
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDelete = (conversationId: string) => {
    deleteConversation(conversationId);
  };

  const sortedConversations = useMemo(
    () =>
      [...conversations]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .filter((c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [conversations, searchQuery]
  );

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed lg:relative z-50 lg:z-auto h-full flex flex-col bg-[#171717] border-r border-[#2f2f2f] transition-all duration-300 overflow-hidden",
          isOpen ? "w-64" : "w-0 lg:w-20 lg:min-w-[5rem]"
        )}
      >
        {/* TOP AREA */}
        {isOpen ? (
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#2f2f2f]">
            <Button
              onClick={onNewConversation}
              className="flex items-center gap-2 bg-transparent border border-[#4a4a4a] text-white hover:bg-[#2f2f2f] rounded-lg h-9 px-3 text-sm"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
              New chat
            </Button>

            <div className="flex items-center gap-2">
              <Button
                onClick={onClose}
                size="icon"
                variant="ghost"
                className="hidden lg:inline-flex text-[#b4b4b4] hover:text-white hover:bg-[#2f2f2f]"
                aria-label="Close sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                onClick={onClose}
                size="icon"
                variant="ghost"
                className="text-[#b4b4b4] hover:text-white hover:bg-[#2f2f2f] lg:hidden"
                aria-label="Close sidebar (mobile)"
              >
                <PanelLeftClose className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 border-b border-[#2f2f2f]">
            <button
              className="w-10 h-10 rounded-md flex items-center justify-center"
              onMouseEnter={() => setTopHover(true)}
              onMouseLeave={() => setTopHover(false)}
              onClick={onToggle}
            >
              {!topHover ? (
                <div className="w-8 h-8 rounded-md bg-[#0f1720] flex items-center justify-center text-white text-sm font-semibold">
                  CG
                </div>
              ) : (
                <div className="w-8 h-8 rounded-md flex items-center justify-center text-[#b4b4b4] hover:text-white hover:bg-[#2f2f2f]">
                  <MenuIcon className="w-5 h-5" />
                </div>
              )}
            </button>

            {/* collapsed quick icons */}
            <div className="flex flex-col items-center gap-2 mt-2">
              <button
                onClick={onNewConversation}
                className="w-9 h-9 rounded-md flex items-center justify-center text-[#b4b4b4] hover:text-white hover:bg-[#2f2f2f]"
                title="New chat"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                onClick={onToggle}
                className="w-9 h-9 rounded-md flex items-center justify-center text-[#b4b4b4] hover:text-white hover:bg-[#2f2f2f]"
                title="Search chats"
              >
                <SearchIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* NAV / SHORTCUTS */}
        {isOpen ? (
          <div className="px-2 py-2 space-y-2">
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-[#2f2f2f] px-3 py-2 rounded-md">
              <SearchIcon className="w-4 h-4 text-[#b4b4b4]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="bg-transparent outline-none text-sm text-white flex-1"
              />
            </div>

            {/* Links */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-[#b4b4b4] hover:text-white hover:bg-[#2f2f2f] h-9"
              onClick={() =>
                window.open("https://sora.chatgpt.com/explore", "_blank")
              }
            >
              <Library className="w-4 h-4" />
              Library
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-[#b4b4b4] hover:text-white hover:bg-[#2f2f2f] h-9"
              onClick={() =>
                window.open("https://sora.chatgpt.com/explore", "_blank")
              }
            >
              <Sparkles className="w-4 h-4" />
              Sora
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-[#b4b4b4] hover:text-white hover:bg-[#2f2f2f] h-9"
              onClick={() =>
                window.open("https://sora.chatgpt.com/explore", "_blank")
              }
            >
              <Zap className="w-4 h-4" />
              GPTs
            </Button>
          </div>
        ) : (
          <div className="flex-0" />
        )}

        {/* CHATS LIST */}
        {isOpen ? (
          <>
            <div className="px-3 pt-2">
              <h3 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-2">
                Chats
              </h3>
            </div>
            <ScrollArea className="flex-1 px-2">
              <div className="space-y-1 pb-2">
                {sortedConversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className={cn(
                      "group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                      activeConversationId === conversation._id
                        ? "bg-[#2f2f2f] text-white"
                        : "hover:bg-[#2f2f2f] text-[#b4b4b4] hover:text-white"
                    )}
                    onClick={() => onSelectConversation(conversation._id)}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    {editingId === conversation._id ? (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleEditSave}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave();
                          if (e.key === "Escape") handleEditCancel();
                        }}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-white"
                        autoFocus
                      />
                    ) : (
                      <span className="flex-1 text-sm truncate">
                        {conversation.title}
                      </span>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-[#404040]"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#2f2f2f] border border-[#3a3a3a]"
                      >
                        <DropdownMenuItem
                          onClick={() => handleEditStart(conversation)}
                          className="text-white hover:bg-[#404040]"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(conversation._id)}
                          className="text-red-400 hover:bg-[#404040]"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1" />
        )}

        {/* PROFILE */}
        <div
          className={cn(
            "p-3 border-t border-[#2f2f2f]",
            isOpen ? "" : "flex items-center justify-center"
          )}
        >
          {isOpen ? (
            <div className="flex items-center gap-3">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                    userButtonPopoverCard: "bg-[#2f2f2f] border-[#3a3a3a]",
                    userButtonPopoverActionButton:
                      "text-white hover:bg-[#404040]",
                  },
                }}
              />
              <span className="text-sm text-white">Profile</span>
            </div>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-7 h-7 rounded-full",
                    userButtonPopoverCard: "bg-[#2f2f2f] border-[#3a3a3a]",
                    userButtonPopoverActionButton:
                      "text-white hover:bg-[#404040]",
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
