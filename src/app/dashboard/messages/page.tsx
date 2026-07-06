"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreHorizontal,
  ArrowLeft,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Loader2,
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender_id: number;
  sender_name: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: number;
  otherId: number;
  name: string;
  email: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

const avatarColors: Record<string, string> = [
  "bg-[#B8F25E] text-[#202124]",
  "bg-[#60A5FA] text-white",
  "bg-[#A78BFA] text-white",
  "bg-[#F472B6] text-white",
  "bg-[#34D399] text-white",
  "bg-[#FBBF24] text-[#202124]",
  "bg-[#F87171] text-white",
  "bg-[#818CF8] text-white",
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userId = (session?.user as { id?: string })?.id;
  const myId = userId ? Number(userId) : 0;

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setConversations(data);
        setLoadingConvos(false);
      })
      .catch(() => setLoadingConvos(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingMsgs(true);
    fetch(`/api/messages/${selectedId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
        setLoadingMsgs(false);
      })
      .catch(() => setLoadingMsgs(false));

    fetch(`/api/messages/${selectedId}`, { method: "PATCH" });
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConvo = conversations.find((c) => c.id === selectedId) || null;

  const filteredConvos = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvo || sending) return;

    setSending(true);
    const text = newMessage;
    setNewMessage("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedConvo.id, text }),
      });
      const msg = await res.json();

      if (msg.id) {
        setMessages((prev) => [...prev, msg]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConvo.id
              ? { ...c, lastMessage: text, lastTime: "Just now" }
              : c
          )
        );
      }
    } catch (e) {
      console.error("Send failed:", e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full gap-0 rounded-[24px] bg-white shadow-sm overflow-hidden" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      {/* Conversations List */}
      <div className={`w-[360px] flex flex-col border-r border-gray-100 ${showMobileList ? "flex" : "hidden md:flex"}`}>
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-2xl font-semibold text-[#202124]">Messages</h2>
          {conversations.reduce((acc, c) => acc + c.unread, 0) > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B8F25E] text-[11px] font-bold text-[#202124]">
              {conversations.reduce((acc, c) => acc + c.unread, 0)}
            </span>
          )}
        </div>

        <div className="px-5 pb-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-full bg-gray-50 py-3 pl-11 pr-4 text-sm text-[#202124] outline-none transition-all placeholder:text-[#B0B0B0] focus:bg-gray-100 focus:ring-1 focus:ring-[#B8F25E]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          {loadingConvos ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-[#9A9A9A]" />
            </div>
          ) : filteredConvos.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-[#9A9A9A]">No conversations yet</p>
              <p className="mt-1 text-xs text-[#B0B0B0]">Start chatting from a listing</p>
            </div>
          ) : (
            filteredConvos.map((convo) => {
              const isActive = selectedId === convo.id;
              const initials = getInitials(convo.name);
              const color = getColor(convo.name);
              return (
                <button
                  key={convo.id}
                  onClick={() => {
                    setSelectedId(convo.id);
                    setShowMobileList(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-[16px] px-4 py-3.5 text-left transition-all ${
                    isActive ? "bg-[#202124]/5" : "hover:bg-gray-50"
                  }`}
                >
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${color}`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#202124]">{convo.name}</span>
                      <span className="text-[11px] text-[#9A9A9A]">{convo.lastTime}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className={`text-xs truncate ${convo.unread > 0 ? "font-semibold text-[#202124]" : "text-[#9A9A9A]"}`}>
                        {convo.lastMessage}
                      </span>
                      {convo.unread > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B8F25E] px-1.5 text-[10px] font-bold text-[#202124]">
                          {convo.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConvo ? (
        <div className={`flex flex-1 flex-col ${!showMobileList ? "flex" : "hidden md:flex"}`}>
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileList(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B6B6B] hover:bg-gray-100 md:hidden"
              >
                <ArrowLeft size={20} />
              </button>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${getColor(selectedConvo.name)}`}>
                {getInitials(selectedConvo.name)}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#202124]">{selectedConvo.name}</h3>
                <p className="text-[11px] text-[#9A9A9A]">{selectedConvo.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B6B6B] transition-colors hover:bg-gray-100 hover:text-[#202124]">
                <Phone size={18} />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B6B6B] transition-colors hover:bg-gray-100 hover:text-[#202124]">
                <Video size={18} />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B6B6B] transition-colors hover:bg-gray-100 hover:text-[#202124]">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {loadingMsgs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-[#9A9A9A]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-sm text-[#9A9A9A]">No messages yet</p>
                <p className="text-xs text-[#B0B0B0]">Send a message to start chatting</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === myId;
                  const showAvatar = i === 0 || messages[i - 1].sender_id !== msg.sender_id;

                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && showAvatar && (
                        <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${getColor(msg.sender_name)}`}>
                          {getInitials(msg.sender_name)}
                        </div>
                      )}
                      {!isMe && !showAvatar && <div className="w-7 flex-shrink-0" />}

                      <div className="max-w-[65%]">
                        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isMe
                            ? "bg-[#202124] text-white rounded-br-md"
                            : "bg-gray-100 text-[#202124] rounded-bl-md"
                        }`}>
                          {msg.text}
                        </div>
                        <div className={`mt-1 flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
                          <span className="text-[10px] text-[#B0B0B0]">{timeAgo(msg.created_at)}</span>
                          {isMe && (
                            msg.read ? (
                              <CheckCheck size={12} className="text-[#B8F25E]" />
                            ) : (
                              <Check size={12} className="text-[#B0B0B0]" />
                            )
                          )}
                        </div>
                      </div>

                      {isMe && showAvatar && (
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#202124] text-[9px] font-semibold text-white">
                          {session?.user?.name?.charAt(0)?.toUpperCase() || "Y"}
                        </div>
                      )}
                      {isMe && !showAvatar && <div className="w-7 flex-shrink-0" />}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-1">
                <button className="flex h-9 w-9 items-center justify-center rounded-full text-[#9A9A9A] transition-colors hover:bg-gray-100 hover:text-[#202124]">
                  <Paperclip size={18} />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-full text-[#9A9A9A] transition-colors hover:bg-gray-100 hover:text-[#202124]">
                  <ImageIcon size={18} />
                </button>
              </div>
              <div className="flex flex-1 items-end rounded-2xl bg-gray-50 px-4 py-2.5 transition-all focus-within:bg-gray-100 focus-within:ring-1 focus-within:ring-[#B8F25E]">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm text-[#202124] outline-none placeholder:text-[#B0B0B0]"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                  newMessage.trim() && !sending
                    ? "bg-[#B8F25E] text-[#202124] shadow-sm hover:bg-[#a8e04e] hover:shadow-md"
                    : "bg-gray-100 text-[#B0B0B0]"
                }`}
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden flex-1 flex-col items-center justify-center md:flex">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <Send size={32} className="text-[#9A9A9A]" />
          </div>
          <p className="mt-4 text-lg font-medium text-[#9A9A9A]">Select a conversation</p>
          <p className="mt-1 text-sm text-[#B0B0B0]">Start messaging from your conversations</p>
        </div>
      )}
    </div>
  );
}
