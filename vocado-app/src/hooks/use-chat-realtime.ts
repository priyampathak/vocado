"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useChatStore, ChatMessage } from "@/store/useChatStore";

// ──────────────────────────────────────────
// Module-level refs
// ──────────────────────────────────────────

const typingChannels = new Map<string, ReturnType<typeof supabase.channel>>();
let workspaceChannel: ReturnType<typeof supabase.channel> | null = null;

// ──────────────────────────────────────────
// Public: broadcast a message via workspace channel
// All workspace members receive this regardless of
// which conversations they have loaded.
// ──────────────────────────────────────────

export function broadcastNewMessage(message: ChatMessage) {
    if (!workspaceChannel) return;
    workspaceChannel.send({
        type: "broadcast",
        event: "new_message",
        payload: message,
    });
}

// ──────────────────────────────────────────
// Public: broadcast typing via per-conversation channel
// ──────────────────────────────────────────

let lastTypingTs = 0;
const typingTimers = new Map<string, NodeJS.Timeout>();

export function broadcastTypingToConversation(
    conversationId: string,
    clerkId: string,
    isTyping: boolean
) {
    const channel = typingChannels.get(conversationId);
    if (!channel || !clerkId) return;

    const now = Date.now();
    if (isTyping && now - lastTypingTs < 2000) return;
    lastTypingTs = now;

    channel.send({
        type: "broadcast",
        event: "typing",
        payload: { clerkId, isTyping },
    });

    const prev = typingTimers.get(conversationId);
    if (prev) clearTimeout(prev);

    if (isTyping) {
        typingTimers.set(
            conversationId,
            setTimeout(() => {
                channel.send({
                    type: "broadcast",
                    event: "typing",
                    payload: { clerkId, isTyping: false },
                });
                typingTimers.delete(conversationId);
            }, 3000)
        );
    }
}

// ──────────────────────────────────────────
// Hook: workspace-level message channel
// Every user on the chat page subscribes to ONE
// shared workspace channel. Handles:
//   - adding messages
//   - sidebar preview updates
//   - unread badges
//   - auto-refreshing conversation list for new DMs
// ──────────────────────────────────────────

export function useWorkspaceMessages(
    workspaceId: string,
    currentUserId: string | null,
    refreshConversations: () => Promise<void>
) {
    const refreshRef = useRef(refreshConversations);
    refreshRef.current = refreshConversations;

    useEffect(() => {
        if (!workspaceId || !currentUserId) return;

        if (workspaceChannel) {
            supabase.removeChannel(workspaceChannel);
            workspaceChannel = null;
        }

        const channel = supabase.channel(`workspace:${workspaceId}:msgs`, {
            config: { broadcast: { self: false } },
        });

        channel
            .on("broadcast", { event: "new_message" }, async ({ payload: data }) => {
                const msg = data as ChatMessage;
                if (!msg || !msg.conversationId) return;

                const store = useChatStore.getState();

                const known = store.conversations.some((c) => c.id === msg.conversationId);
                if (!known) {
                    await refreshRef.current();
                }

                store.addMessage(msg.conversationId, msg);

                const preview =
                    msg.content.length > 120
                        ? msg.content.substring(0, 120) + "…"
                        : msg.content;
                store.updateConversationPreview(
                    msg.conversationId,
                    preview,
                    msg.sender.id,
                    new Date(msg.createdAt)
                );

                if (
                    store.activeConversationId !== msg.conversationId &&
                    msg.sender.id !== currentUserId
                ) {
                    store.incrementUnread(msg.conversationId);
                }
            })
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    // eslint-disable-next-line no-console
                    console.log("[chat] workspace message channel ready");
                }
            });

        workspaceChannel = channel;

        return () => {
            supabase.removeChannel(channel);
            workspaceChannel = null;
        };
    }, [workspaceId, currentUserId]);
}

// ──────────────────────────────────────────
// Hook: per-conversation typing subscriptions
// These are lightweight channels that only
// carry typing indicator events.
// ──────────────────────────────────────────

export function useConversationSubscriptions(
    conversationIds: string[],
    currentClerkId: string | null
) {
    useEffect(() => {
        const currentIds = new Set(conversationIds);

        for (const [id, ch] of typingChannels) {
            if (!currentIds.has(id)) {
                supabase.removeChannel(ch);
                typingChannels.delete(id);
            }
        }

        for (const convId of conversationIds) {
            if (typingChannels.has(convId)) continue;

            const channel = supabase.channel(`typing:${convId}`, {
                config: { broadcast: { self: false } },
            });

            channel
                .on("broadcast", { event: "typing" }, ({ payload: data }) => {
                    const { clerkId, isTyping } = data as {
                        clerkId: string;
                        isTyping: boolean;
                    };
                    if (clerkId !== currentClerkId) {
                        useChatStore
                            .getState()
                            .setTypingUser(convId, clerkId, isTyping);
                    }
                })
                .subscribe();

            typingChannels.set(convId, channel);
        }

        return () => {
            for (const ch of typingChannels.values()) {
                supabase.removeChannel(ch);
            }
            typingChannels.clear();
        };
    }, [conversationIds.join(","), currentClerkId]);
}
