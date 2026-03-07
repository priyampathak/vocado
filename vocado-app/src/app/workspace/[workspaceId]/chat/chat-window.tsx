"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import {
    Phone,
    Video,
    Search,
    MoreHorizontal,
    Users,
    Hash,
    Loader2,
    ChevronLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useChatStore, ChatConversation } from "@/store/useChatStore";
import { broadcastNewMessage, broadcastTypingToConversation } from "@/hooks/use-chat-realtime";
import { getMessages, markAsRead, sendMessage } from "@/app/actions/chat";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";

interface ChatWindowProps {
    workspaceId: string;
    conversation: ChatConversation;
    currentUserId: string | null;
    currentClerkId: string | null;
    onBack?: () => void;
    isMobile?: boolean;
}

export function ChatWindow({
    workspaceId,
    conversation,
    currentUserId,
    currentClerkId,
    onBack,
    isMobile,
}: ChatWindowProps) {
    const {
        messages: allMessages,
        setMessages,
        prependMessages,
        addMessage,
        replaceOptimisticMessage,
        removeMessage,
        hasMore,
        setHasMore,
        clearUnread,
        updateConversationPreview,
        typingUsers,
        onlineUsers,
        workspaceMembers,
    } = useChatStore();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [initialLoaded, setInitialLoaded] = useState(false);
    const prevConvId = useRef<string | null>(null);

    const messages = allMessages[conversation.id] || [];
    const canLoadMore = hasMore[conversation.id] ?? true;

    useEffect(() => {
        if (prevConvId.current === conversation.id && initialLoaded) return;
        prevConvId.current = conversation.id;
        setInitialLoaded(false);

        (async () => {
            try {
                const result = await getMessages(conversation.id);
                setMessages(conversation.id, result.messages);
                setHasMore(conversation.id, result.hasMore);
                setInitialLoaded(true);
                await markAsRead(conversation.id);
                clearUnread(conversation.id);
            } catch (err) {
                console.error("Failed to load messages:", err);
                setInitialLoaded(true);
            }
        })();
    }, [conversation.id]);

    useEffect(() => {
        if (initialLoaded) {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }
    }, [initialLoaded]);

    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.sender.id === currentUserId) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        } else if (lastMsg) {
            const container = scrollContainerRef.current;
            if (container) {
                const distanceFromBottom =
                    container.scrollHeight - container.scrollTop - container.clientHeight;
                if (distanceFromBottom < 150) {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }
            }
        }
    }, [messages.length]);

    useEffect(() => {
        if (!canLoadMore || isLoadingMore || !initialLoaded) return;

        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                if (entries[0].isIntersecting && canLoadMore && !isLoadingMore) {
                    setIsLoadingMore(true);
                    try {
                        const oldest = messages[0];
                        if (!oldest) return;
                        const result = await getMessages(conversation.id, {
                            before: oldest.id,
                        });
                        prependMessages(conversation.id, result.messages);
                        setHasMore(conversation.id, result.hasMore);
                    } catch (err) {
                        console.error("Failed to load more:", err);
                    } finally {
                        setIsLoadingMore(false);
                    }
                }
            },
            { root: scrollContainerRef.current, rootMargin: "100px", threshold: 0.1 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [canLoadMore, isLoadingMore, initialLoaded, messages.length, conversation.id]);

    const handleSend = useCallback(
        async (content: string, mentions: string[]) => {
            if (!currentUserId) return;

            const self = workspaceMembers.find((m) => m.isSelf);
            const optimisticId = `opt_${Date.now()}`;
            const optimisticMsg = {
                id: optimisticId,
                conversationId: conversation.id,
                content,
                mentions,
                isSystem: false,
                sender: {
                    id: currentUserId,
                    name: self?.name || "You",
                    avatarUrl: self?.avatarUrl || null,
                    clerkId: currentClerkId || "",
                },
                createdAt: new Date().toISOString(),
                optimistic: true,
            };

            addMessage(conversation.id, optimisticMsg);
            const preview = content.length > 120 ? content.substring(0, 120) + "…" : content;
            updateConversationPreview(conversation.id, preview, currentUserId, new Date());

            try {
                const saved = await sendMessage(conversation.id, content, mentions);

                replaceOptimisticMessage(
                    conversation.id,
                    optimisticId,
                    { ...saved, optimistic: false } as any
                );

                broadcastNewMessage(saved as any);
            } catch (err: any) {
                console.error("Failed to send message:", err);
                removeMessage(conversation.id, optimisticId);
            }
        },
        [conversation.id, currentUserId, currentClerkId, workspaceMembers]
    );

    const otherMember = conversation.otherMembers?.[0];
    const isOnline =
        conversation.type === "DM" && otherMember
            ? onlineUsers.has(otherMember.clerkId)
            : false;

    const typing = typingUsers[conversation.id] || [];
    const typingNames = typing
        .map((clerkId) => workspaceMembers.find((m) => m.clerkId === clerkId)?.name?.split(" ")[0])
        .filter(Boolean);

    const handleComingSoon = () => {
        alert("Coming soon!");
    };

    const getDisplayName = () => {
        if (conversation.type === "CHANNEL") return `# ${conversation.name}`;
        return conversation.name;
    };

    const getSubtext = () => {
        if (conversation.type === "DM") return isOnline ? "Online" : "Offline";
        if (conversation.type === "GROUP_DM")
            return `${conversation.members.length} members`;
        if (conversation.type === "CHANNEL")
            return conversation.description || `${conversation.members.length} members`;
        return "";
    };

    const renderDateSeparators = () => {
        const groups: { date: string; msgs: typeof messages }[] = [];
        let lastDate = "";

        for (const msg of messages) {
            const d = new Date(msg.createdAt);
            const dateStr = d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let label = dateStr;
            if (d.toDateString() === today.toDateString()) label = "Today";
            else if (d.toDateString() === yesterday.toDateString()) label = "Yesterday";

            if (label !== lastDate) {
                groups.push({ date: label, msgs: [msg] });
                lastDate = label;
            } else {
                groups[groups.length - 1].msgs.push(msg);
            }
        }

        return groups;
    };

    return (
        <div className={cn(
            "flex flex-1 flex-col",
            isMobile
                ? "h-full bg-(--color-beige)"
                : "rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[oklch(0.93_0.01_130)]"
        )}>
            {/* Header */}
            <div className={cn(
                "flex items-center justify-between border-b border-[oklch(0.93_0.01_130)]",
                isMobile ? "px-3 py-2.5 bg-white/60 backdrop-blur-xl" : "px-5 py-3"
            )}>
                <div className="flex items-center gap-3">
                    {isMobile && onBack && (
                        <button
                            onClick={onBack}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate/6 active:bg-slate/12 transition-colors -ml-1 mr-0.5"
                        >
                            <ChevronLeft className="h-5 w-5 text-slate/70" />
                        </button>
                    )}
                    <Avatar className="h-8 w-8">
                        {conversation.type === "DM" && otherMember?.avatarUrl && (
                            <AvatarImage src={otherMember.avatarUrl} />
                        )}
                        <AvatarFallback
                            className={cn(
                                "text-[10px] font-bold",
                                conversation.type === "CHANNEL"
                                    ? "bg-[oklch(0.92_0.04_135)] text-[oklch(0.45_0.08_135)]"
                                    : conversation.type === "GROUP_DM"
                                    ? "bg-[oklch(0.85_0.08_200)] text-white"
                                    : "bg-linear-to-br from-[oklch(0.55_0.14_135)] to-[oklch(0.7_0.12_115)] text-white"
                            )}
                        >
                            {conversation.type === "CHANNEL" ? (
                                <Hash className="h-4 w-4" />
                            ) : conversation.type === "GROUP_DM" ? (
                                <Users className="h-4 w-4" />
                            ) : (
                                conversation.name
                                    .split(" ")
                                    .map((w) => w[0])
                                    .join("")
                                    .substring(0, 2)
                                    .toUpperCase()
                            )}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-[14px] font-semibold text-[oklch(0.2_0.03_135)]">
                            {getDisplayName()}
                        </h3>
                        <p className="text-[11px] text-[oklch(0.6_0.04_135)] flex items-center gap-1">
                            {isOnline && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.7_0.15_150)]" />
                            )}
                            {getSubtext()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {[Phone, Video, Search, MoreHorizontal].map((Icon, i) => (
                        <button
                            key={i}
                            onClick={handleComingSoon}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[oklch(0.55_0.04_135)] transition-colors hover:bg-[oklch(0.96_0.02_135)]"
                        >
                            <Icon className="h-4 w-4" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollContainerRef}
                className={cn("flex-1 overflow-y-auto py-4", isMobile ? "px-3" : "px-5")}
            >
                {!initialLoaded ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-[oklch(0.55_0.04_135)]" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {/* Load more sentinel */}
                        <div ref={sentinelRef} className="h-1" />
                        {isLoadingMore && (
                            <div className="flex justify-center py-2">
                                <Loader2 className="h-4 w-4 animate-spin text-[oklch(0.55_0.04_135)]" />
                            </div>
                        )}

                        {renderDateSeparators().map((group) => (
                            <React.Fragment key={group.date}>
                                <div className="flex items-center gap-3 py-3">
                                    <div className="h-px flex-1 bg-[oklch(0.93_0.01_130)]" />
                                    <span className="text-[11px] font-medium text-[oklch(0.6_0.04_135)]">
                                        {group.date}
                                    </span>
                                    <div className="h-px flex-1 bg-[oklch(0.93_0.01_130)]" />
                                </div>
                                {group.msgs.map((msg, idx) => {
                                    const prev = idx > 0 ? group.msgs[idx - 1] : null;
                                    const showAvatar =
                                        !prev || prev.sender.id !== msg.sender.id;
                                    return (
                                        <MessageBubble
                                            key={msg.id}
                                            message={msg}
                                            isSelf={msg.sender.id === currentUserId}
                                            showAvatar={showAvatar}
                                            workspaceMembers={workspaceMembers}
                                        />
                                    );
                                })}
                            </React.Fragment>
                        ))}

                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <p className="text-[13px] font-medium text-[oklch(0.4_0.03_135)]">
                                    No messages yet
                                </p>
                                <p className="text-[11.5px] text-[oklch(0.55_0.04_135)]">
                                    Send the first message to start the conversation
                                </p>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Typing indicator */}
            {typingNames.length > 0 && (
                <div className="px-5 pb-1">
                    <p className="text-[11px] text-[oklch(0.55_0.04_135)] animate-pulse">
                        {typingNames.join(", ")}{" "}
                        {typingNames.length === 1 ? "is" : "are"} typing...
                    </p>
                </div>
            )}

            {/* Input */}
            <MessageInput
                onSend={handleSend}
                onTyping={() => broadcastTypingToConversation(conversation.id, currentClerkId || "", true)}
                workspaceMembers={workspaceMembers}
                isMobile={isMobile}
            />
        </div>
    );
}
