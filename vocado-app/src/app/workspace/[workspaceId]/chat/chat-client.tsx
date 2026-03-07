"use client";

import React, { useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useChatStore, ChatConversation, WorkspaceMemberChat } from "@/store/useChatStore";
import {
    useWorkspaceMessages,
    useConversationSubscriptions,
} from "@/hooks/use-chat-realtime";
import { usePresence } from "@/hooks/use-presence";
import { useMobile } from "@/hooks/use-mobile";
import { getConversations } from "@/app/actions/chat";
import { ConversationList } from "./conversation-list";
import { ChatWindow } from "./chat-window";
import { MessageCircle } from "lucide-react";

interface ChatClientProps {
    workspaceId: string;
    initialConversations: any[];
    initialUnreadCounts: Record<string, number>;
    initialMembers: WorkspaceMemberChat[];
}

export function ChatClient({
    workspaceId,
    initialConversations,
    initialUnreadCounts,
    initialMembers,
}: ChatClientProps) {
    const { user } = useUser();
    const isMobile = useMobile();
    const {
        conversations,
        setConversations,
        setUnreadCounts,
        setWorkspaceMembers,
        activeConversationId,
        setActiveConversationId,
        workspaceMembers,
    } = useChatStore();

    useEffect(() => {
        setConversations(initialConversations as ChatConversation[]);
        setUnreadCounts(initialUnreadCounts);
        setWorkspaceMembers(initialMembers);
    }, []);

    const currentDbUser = workspaceMembers.find((m) => m.isSelf);
    const clerkId = user?.id || null;
    const currentUserId = currentDbUser?.userId || null;

    const refreshConversations = useCallback(async () => {
        try {
            const fresh = await getConversations(workspaceId);
            setConversations(fresh as ChatConversation[]);
        } catch (err) {
            console.error("Failed to refresh conversations:", err);
        }
    }, [workspaceId]);

    usePresence(workspaceId, clerkId);
    useWorkspaceMessages(workspaceId, currentUserId, refreshConversations);
    useConversationSubscriptions(
        conversations.map((c) => c.id),
        clerkId
    );

    const activeConv = conversations.find((c) => c.id === activeConversationId) || null;

    const handleBack = () => setActiveConversationId(null);

    // ── Mobile: show either list OR chat window ──
    if (isMobile) {
        if (activeConv) {
            return (
                <div className="fixed inset-0 top-14 bottom-[76px] z-30 flex flex-col bg-(--color-beige)">
                    <ChatWindow
                        workspaceId={workspaceId}
                        conversation={activeConv}
                        currentUserId={currentUserId}
                        currentClerkId={clerkId}
                        onBack={handleBack}
                        isMobile
                    />
                </div>
            );
        }

        return (
            <div className="flex h-full flex-col -mx-3 -mt-1 -mb-24">
                <ConversationList
                    workspaceId={workspaceId}
                    activeConversationId={activeConversationId}
                    onSelectConversation={setActiveConversationId}
                    isMobile
                />
            </div>
        );
    }

    // ── Desktop: side-by-side ──
    return (
        <div className="flex h-full gap-4">
            <ConversationList
                workspaceId={workspaceId}
                activeConversationId={activeConversationId}
                onSelectConversation={setActiveConversationId}
            />

            {activeConv ? (
                <ChatWindow
                    workspaceId={workspaceId}
                    conversation={activeConv}
                    currentUserId={currentUserId}
                    currentClerkId={clerkId}
                />
            ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[oklch(0.93_0.01_130)]">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[oklch(0.96_0.025_135)]">
                            <MessageCircle className="h-8 w-8 text-[oklch(0.55_0.14_135)]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[oklch(0.25_0.03_135)]">
                            Select a conversation
                        </h3>
                        <p className="text-sm text-[oklch(0.55_0.04_135)] max-w-xs">
                            Pick a DM, channel, or thread from the left to start chatting
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
