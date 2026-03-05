"use client";

import React, { useState } from "react";
import {
    MessageCircle,
    Hash,
    Users,
    Search,
    Plus,
    Send,
    Phone,
    Video,
    MoreHorizontal,
    Smile,
    Paperclip,
    AtSign,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

type TabType = "dms" | "threads" | "channels";

interface Conversation {
    id: string;
    name: string;
    initials: string;
    lastMessage: string;
    time: string;
    unread?: number;
    online?: boolean;
    type: TabType;
}

// ──────────────────────────────────────────
// Sample Data (production-ready structure)
// ──────────────────────────────────────────

const conversations: Conversation[] = [
    { id: "1", name: "Sarah Chen", initials: "SC", lastMessage: "Let me check the latest design mockups and get back to you...", time: "2m", unread: 3, online: true, type: "dms" },
    { id: "2", name: "Marcus Rivera", initials: "MR", lastMessage: "The sprint planning is set for tomorrow at 10 AM.", time: "15m", online: true, type: "dms" },
    { id: "3", name: "Emily Watson", initials: "EW", lastMessage: "Great job on the presentation! The client loved it.", time: "1h", online: false, type: "dms" },
    { id: "4", name: "Design Review", initials: "DR", lastMessage: "Thread: Updated the color palette for the dashboard...", time: "30m", unread: 1, type: "threads" },
    { id: "5", name: "API Discussion", initials: "AD", lastMessage: "Thread: Should we migrate to GraphQL for this endpoint?", time: "2h", type: "threads" },
    { id: "6", name: "general", initials: "#", lastMessage: "Marcus: Hey team, the new deployment pipeline is live!", time: "5m", unread: 5, type: "channels" },
    { id: "7", name: "engineering", initials: "#", lastMessage: "Sarah: PR #247 is ready for review.", time: "20m", unread: 2, type: "channels" },
    { id: "8", name: "design", initials: "#", lastMessage: "Emily: New component library draft is up.", time: "45m", type: "channels" },
];

const messages = [
    { id: "m1", sender: "Sarah Chen", initials: "SC", text: "Hey! I just finished reviewing the latest design mockups for the dashboard.", time: "10:30 AM", self: false },
    { id: "m2", sender: "You", initials: "YO", text: "That's great! Were there any significant changes from the last iteration?", time: "10:32 AM", self: true },
    { id: "m3", sender: "Sarah Chen", initials: "SC", text: "Yes, the client wanted a darker sidebar theme and more prominent CTAs. I've updated all the Figma files. Let me check the latest design mockups and get back to you with the full list of changes.", time: "10:35 AM", self: false },
    { id: "m4", sender: "You", initials: "YO", text: "Sounds good. Let's sync after lunch to go over the implementation details together.", time: "10:38 AM", self: true },
];

// ──────────────────────────────────────────
// Chat Page Component
// ──────────────────────────────────────────

export default function ChatPage() {
    const [activeTab, setActiveTab] = useState<TabType>("dms");
    const [selectedConversation, setSelectedConversation] = useState<string>("1");
    const [messageInput, setMessageInput] = useState("");

    const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
        { key: "dms", label: "DMs", icon: MessageCircle },
        { key: "threads", label: "Threads", icon: AtSign },
        { key: "channels", label: "Channels", icon: Hash },
    ];

    const filteredConversations = conversations.filter((c) => c.type === activeTab);
    const selected = conversations.find((c) => c.id === selectedConversation);

    return (
        <div className="flex h-full gap-4">
            {/* ──────────────────────────────────────── */}
            {/* LEFT PANE — 30% — Conversations List   */}
            {/* ──────────────────────────────────────── */}
            <div className="flex w-[30%] shrink-0 flex-col rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[oklch(0.93_0.01_130)]">
                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-[oklch(0.93_0.01_130)] px-3 pt-3 pb-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-[12.5px] font-semibold transition-all duration-200 border-b-2",
                                activeTab === tab.key
                                    ? "border-[oklch(0.55_0.14_135)] text-[oklch(0.3_0.04_135)] bg-[oklch(0.97_0.01_135)]"
                                    : "border-transparent text-[oklch(0.55_0.04_135)] hover:text-[oklch(0.35_0.04_135)] hover:bg-[oklch(0.98_0.005_135)]"
                            )}
                        >
                            <tab.icon className="h-3.5 w-3.5" />
                            {tab.label}
                        </button>
                    ))}
                    <button className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-[oklch(0.55_0.04_135)] transition-colors hover:bg-[oklch(0.96_0.02_135)]">
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-3 py-2">
                    <div className="flex items-center gap-2 rounded-xl bg-[oklch(0.97_0.008_135)] px-3 py-2 border border-[oklch(0.93_0.01_130)]">
                        <Search className="h-3.5 w-3.5 text-[oklch(0.6_0.04_135)]" />
                        <input
                            placeholder="Search conversations..."
                            className="flex-1 bg-transparent text-[12.5px] text-[oklch(0.3_0.04_135)] placeholder:text-[oklch(0.6_0.04_135)] outline-none"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto px-2 pb-2">
                    {filteredConversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv.id)}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
                                selectedConversation === conv.id
                                    ? "bg-[oklch(0.96_0.025_135)] shadow-[0_1px_3px_rgb(0,0,0,0.03)]"
                                    : "hover:bg-[oklch(0.98_0.005_135)]"
                            )}
                        >
                            <div className="relative">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback
                                        className={cn(
                                            "text-[11px] font-bold",
                                            conv.type === "channels"
                                                ? "bg-[oklch(0.92_0.04_135)] text-[oklch(0.45_0.08_135)]"
                                                : "bg-gradient-to-br from-[oklch(0.55_0.14_135)] to-[oklch(0.7_0.12_115)] text-white"
                                        )}
                                    >
                                        {conv.initials}
                                    </AvatarFallback>
                                </Avatar>
                                {conv.online && (
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[oklch(0.7_0.15_150)]" />
                                )}
                            </div>
                            <div className="flex flex-1 flex-col min-w-0 gap-0.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[13px] font-semibold text-[oklch(0.25_0.03_135)] truncate">
                                        {conv.type === "channels" ? `# ${conv.name}` : conv.name}
                                    </span>
                                    <span className="shrink-0 text-[10px] text-[oklch(0.6_0.04_135)]">{conv.time}</span>
                                </div>
                                <p className="truncate text-[11.5px] text-[oklch(0.55_0.03_135)]">{conv.lastMessage}</p>
                            </div>
                            {conv.unread && (
                                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[oklch(0.55_0.14_135)] px-1.5 text-[10px] font-bold text-white">
                                    {conv.unread}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ──────────────────────────────────────── */}
            {/* RIGHT PANE — 70% — Message Interface   */}
            {/* ──────────────────────────────────────── */}
            <div className="flex flex-1 flex-col rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[oklch(0.93_0.01_130)]">
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-[oklch(0.93_0.01_130)] px-5 py-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-[oklch(0.55_0.14_135)] to-[oklch(0.7_0.12_115)] text-[10px] font-bold text-white">
                                {selected?.initials ?? "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-[14px] font-semibold text-[oklch(0.2_0.03_135)]">
                                {selected?.name ?? "Select a conversation"}
                            </h3>
                            <p className="text-[11px] text-[oklch(0.6_0.04_135)]">
                                {selected?.online ? "Online" : "Offline"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[oklch(0.55_0.04_135)] transition-colors hover:bg-[oklch(0.96_0.02_135)]">
                            <Phone className="h-4 w-4" />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[oklch(0.55_0.04_135)] transition-colors hover:bg-[oklch(0.96_0.02_135)]">
                            <Video className="h-4 w-4" />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[oklch(0.55_0.04_135)] transition-colors hover:bg-[oklch(0.96_0.02_135)]">
                            <Search className="h-4 w-4" />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[oklch(0.55_0.04_135)] transition-colors hover:bg-[oklch(0.96_0.02_135)]">
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    <div className="flex flex-col gap-5">
                        {/* Date Separator */}
                        <div className="flex items-center gap-3 py-2">
                            <div className="h-px flex-1 bg-[oklch(0.93_0.01_130)]" />
                            <span className="text-[11px] font-medium text-[oklch(0.6_0.04_135)]">Today</span>
                            <div className="h-px flex-1 bg-[oklch(0.93_0.01_130)]" />
                        </div>

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex gap-3 group",
                                    msg.self && "flex-row-reverse"
                                )}
                            >
                                <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                                    <AvatarFallback
                                        className={cn(
                                            "text-[10px] font-bold",
                                            msg.self
                                                ? "bg-[oklch(0.55_0.14_135)] text-white"
                                                : "bg-gradient-to-br from-[oklch(0.65_0.1_200)] to-[oklch(0.55_0.12_220)] text-white"
                                        )}
                                    >
                                        {msg.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={cn("flex max-w-[70%] flex-col gap-1", msg.self && "items-end")}>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-[12px] font-semibold text-[oklch(0.3_0.03_135)]">
                                            {msg.sender}
                                        </span>
                                        <span className="text-[10px] text-[oklch(0.6_0.04_135)]">{msg.time}</span>
                                    </div>
                                    <div
                                        className={cn(
                                            "rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
                                            msg.self
                                                ? "rounded-tr-md bg-[oklch(0.55_0.14_135)] text-white"
                                                : "rounded-tl-md bg-[oklch(0.97_0.008_135)] text-[oklch(0.25_0.03_135)] border border-[oklch(0.93_0.01_130)]"
                                        )}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Message Input */}
                <div className="border-t border-[oklch(0.93_0.01_130)] p-3">
                    <div className="flex items-end gap-2 rounded-2xl border border-[oklch(0.93_0.01_130)] bg-[oklch(0.99_0.005_135)] px-3 py-2 focus-within:ring-2 focus-within:ring-[oklch(0.55_0.14_135)]/20 transition-all">
                        <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[oklch(0.55_0.04_135)] transition-colors hover:bg-[oklch(0.94_0.02_135)]">
                            <Plus className="h-4 w-4" />
                        </button>
                        <textarea
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type a message..."
                            rows={1}
                            className="flex-1 resize-none bg-transparent py-1.5 text-[13px] text-[oklch(0.25_0.03_135)] placeholder:text-[oklch(0.6_0.04_135)] outline-none max-h-32"
                        />
                        <div className="flex shrink-0 items-center gap-1">
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[oklch(0.55_0.04_135)] transition-colors hover:bg-[oklch(0.94_0.02_135)]">
                                <Paperclip className="h-4 w-4" />
                            </button>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[oklch(0.55_0.04_135)] transition-colors hover:bg-[oklch(0.94_0.02_135)]">
                                <Smile className="h-4 w-4" />
                            </button>
                            <button
                                disabled={!messageInput.trim()}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.55_0.14_135)] text-white transition-all hover:bg-[oklch(0.5_0.14_135)] disabled:opacity-40"
                            >
                                <Send className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
