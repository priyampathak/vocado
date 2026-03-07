"use client";

import React, { useState, useMemo } from "react";
import {
    MessageCircle,
    Hash,
    AtSign,
    Search,
    Plus,
    Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/useChatStore";
import { NewDMDialog } from "./new-dm-dialog";
import { CreateChannelDialog } from "./create-channel-dialog";

type TabType = "dms" | "threads" | "channels";

interface ConversationListProps {
    workspaceId: string;
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    isMobile?: boolean;
}

export function ConversationList({
    workspaceId,
    activeConversationId,
    onSelectConversation,
    isMobile,
}: ConversationListProps) {
    const [activeTab, setActiveTab] = useState<TabType>("dms");
    const [searchQuery, setSearchQuery] = useState("");
    const [newDMOpen, setNewDMOpen] = useState(false);
    const [createChannelOpen, setCreateChannelOpen] = useState(false);

    const { conversations, unreadCounts, onlineUsers, workspaceMembers } = useChatStore();

    const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
        { key: "dms", label: "DMs", icon: MessageCircle },
        { key: "threads", label: "Threads", icon: AtSign },
        { key: "channels", label: "Channels", icon: Hash },
    ];

    const filtered = useMemo(() => {
        let list = conversations;

        if (activeTab === "dms") {
            list = list.filter((c) => c.type === "DM" || c.type === "GROUP_DM");
        } else if (activeTab === "channels") {
            list = list.filter((c) => c.type === "CHANNEL");
        } else {
            return [];
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.lastMessageText?.toLowerCase().includes(q)
            );
        }

        return list.sort((a, b) => {
            const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return bTime - aTime;
        });
    }, [conversations, activeTab, searchQuery]);

    const formatTime = (date: Date | string | null) => {
        if (!date) return "";
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return "now";
        if (diffMin < 60) return `${diffMin}m`;
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return `${diffH}h`;
        const diffD = Math.floor(diffH / 24);
        if (diffD < 7) return `${diffD}d`;
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const isUserOnline = (members: any[]) => {
        return members.some((m: any) => onlineUsers.has(m.clerkId));
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    const handlePlusClick = () => {
        if (activeTab === "dms") setNewDMOpen(true);
        if (activeTab === "channels") setCreateChannelOpen(true);
    };

    return (
        <>
            <div className={cn(
                "flex shrink-0 flex-col",
                isMobile
                    ? "w-full h-full bg-(--color-beige)"
                    : "w-[30%] min-w-[280px] max-w-[360px] rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[oklch(0.93_0.01_130)]"
            )}>
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
                    {activeTab !== "threads" && (
                        <button
                            onClick={handlePlusClick}
                            className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-[oklch(0.55_0.04_135)] transition-colors hover:bg-[oklch(0.96_0.02_135)]"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="px-3 py-2">
                    <div className="flex items-center gap-2 rounded-xl bg-[oklch(0.97_0.008_135)] px-3 py-2 border border-[oklch(0.93_0.01_130)]">
                        <Search className="h-3.5 w-3.5 text-[oklch(0.6_0.04_135)]" />
                        <input
                            placeholder={activeTab === "threads" ? "Search mentions..." : "Search conversations..."}
                            className="flex-1 bg-transparent text-[12.5px] text-[oklch(0.3_0.04_135)] placeholder:text-[oklch(0.6_0.04_135)] outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto px-2 pb-2">
                    {activeTab === "threads" ? (
                        <ThreadsPlaceholder />
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-10 w-10 rounded-xl bg-[oklch(0.96_0.02_135)] flex items-center justify-center mb-3">
                                {activeTab === "dms" ? (
                                    <MessageCircle className="h-5 w-5 text-[oklch(0.55_0.04_135)]" />
                                ) : (
                                    <Hash className="h-5 w-5 text-[oklch(0.55_0.04_135)]" />
                                )}
                            </div>
                            <p className="text-[12.5px] text-[oklch(0.55_0.04_135)]">
                                {searchQuery
                                    ? "No results found"
                                    : activeTab === "dms"
                                    ? "No conversations yet"
                                    : "No channels joined yet"}
                            </p>
                            <button
                                onClick={handlePlusClick}
                                className="mt-2 text-[12px] font-medium text-[oklch(0.55_0.14_135)] hover:underline"
                            >
                                {activeTab === "dms" ? "Start a conversation" : "Create or join a channel"}
                            </button>
                        </div>
                    ) : (
                        filtered.map((conv) => {
                            const unread = unreadCounts[conv.id] || 0;
                            const online =
                                conv.type === "DM"
                                    ? isUserOnline(conv.otherMembers)
                                    : false;
                            const avatar =
                                conv.type === "DM" ? conv.otherMembers[0]?.avatarUrl : null;
                            const initials =
                                conv.type === "CHANNEL"
                                    ? "#"
                                    : getInitials(conv.name);

                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => onSelectConversation(conv.id)}
                                    className={cn(
                                        "flex w-full items-center gap-3 text-left transition-all duration-150",
                                        isMobile
                                            ? "rounded-2xl px-4 py-3.5 active:scale-[0.98] bg-white/60 shadow-[0_1px_4px_rgba(0,0,0,0.03)] border border-white/40 mb-1.5"
                                            : cn(
                                                "rounded-xl px-3 py-2.5",
                                                activeConversationId === conv.id
                                                    ? "bg-[oklch(0.96_0.025_135)] shadow-[0_1px_3px_rgb(0,0,0,0.03)]"
                                                    : "hover:bg-[oklch(0.98_0.005_135)]"
                                            ),
                                        isMobile && activeConversationId === conv.id && "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] border-white/60"
                                    )}
                                >
                                    <div className="relative">
                                        <Avatar className="h-9 w-9">
                                            {avatar && <AvatarImage src={avatar} />}
                                            <AvatarFallback
                                                className={cn(
                                                    "text-[11px] font-bold",
                                                    conv.type === "CHANNEL"
                                                        ? "bg-[oklch(0.92_0.04_135)] text-[oklch(0.45_0.08_135)]"
                                                        : conv.type === "GROUP_DM"
                                                        ? "bg-[oklch(0.85_0.08_200)] text-white"
                                                        : "bg-linear-to-br from-[oklch(0.55_0.14_135)] to-[oklch(0.7_0.12_115)] text-white"
                                                )}
                                            >
                                                {conv.type === "GROUP_DM" ? (
                                                    <Users className="h-4 w-4" />
                                                ) : (
                                                    initials
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        {online && (
                                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[oklch(0.7_0.15_150)]" />
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col min-w-0 gap-0.5">
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={cn(
                                                    "text-[13px] font-semibold truncate",
                                                    unread > 0
                                                        ? "text-[oklch(0.2_0.03_135)]"
                                                        : "text-[oklch(0.3_0.04_135)]"
                                                )}
                                            >
                                                {conv.type === "CHANNEL"
                                                    ? `# ${conv.name}`
                                                    : conv.name}
                                            </span>
                                            <span className="shrink-0 text-[10px] text-[oklch(0.6_0.04_135)]">
                                                {formatTime(conv.lastMessageAt)}
                                            </span>
                                        </div>
                                        <p
                                            className={cn(
                                                "truncate text-[11.5px]",
                                                unread > 0
                                                    ? "text-[oklch(0.35_0.03_135)] font-medium"
                                                    : "text-[oklch(0.55_0.03_135)]"
                                            )}
                                        >
                                            {conv.lastMessageText || "No messages yet"}
                                        </p>
                                    </div>
                                    {unread > 0 && (
                                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[oklch(0.55_0.14_135)] px-1.5 text-[10px] font-bold text-white">
                                            {unread > 99 ? "99+" : unread}
                                        </span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            <NewDMDialog
                open={newDMOpen}
                onOpenChange={setNewDMOpen}
                workspaceId={workspaceId}
                onConversationCreated={(id) => {
                    onSelectConversation(id);
                    setNewDMOpen(false);
                }}
            />

            <CreateChannelDialog
                open={createChannelOpen}
                onOpenChange={setCreateChannelOpen}
                workspaceId={workspaceId}
                onChannelCreated={(id) => {
                    onSelectConversation(id);
                    setCreateChannelOpen(false);
                }}
            />
        </>
    );
}

function ThreadsPlaceholder() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-10 w-10 rounded-xl bg-[oklch(0.96_0.02_135)] flex items-center justify-center mb-3">
                <AtSign className="h-5 w-5 text-[oklch(0.55_0.04_135)]" />
            </div>
            <p className="text-[13px] font-medium text-[oklch(0.35_0.03_135)] mb-1">
                Mentions & Threads
            </p>
            <p className="text-[11.5px] text-[oklch(0.55_0.04_135)] max-w-[200px]">
                When someone @mentions you in any conversation, it will appear here
            </p>
        </div>
    );
}
