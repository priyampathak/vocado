"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useChatStore } from "@/store/useChatStore";

export function usePresence(workspaceId: string, clerkId: string | null) {
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const { setOnlineUsers } = useChatStore();

    useEffect(() => {
        if (!workspaceId || !clerkId) return;

        const channel = supabase.channel(`presence:${workspaceId}`, {
            config: { presence: { key: clerkId } },
        });

        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                const online = new Set<string>();
                for (const key of Object.keys(state)) {
                    online.add(key);
                }
                setOnlineUsers(online);
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({ clerkId, online_at: new Date().toISOString() });
                }
            });

        channelRef.current = channel;

        return () => {
            channel.untrack();
            supabase.removeChannel(channel);
            channelRef.current = null;
        };
    }, [workspaceId, clerkId]);
}
