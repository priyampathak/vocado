"use client";

import React, { useEffect, useState } from "react";
import { Send, Hash, MessageSquare, X, Users, Loader2 } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function TheStream() {
    const { isStreamOpen, toggleStream, activePlotId } = useUIStore();
    const { user } = useUser();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);

    // We only run this logic if we have a real plotId right now for dummy stream demo
    const channelId = activePlotId || "global-stream";

    useEffect(() => {
        if (!isStreamOpen) return;

        // Setting up the channel for the active Plot
        const channel = supabase.channel(`stream:${channelId}`);

        channel
            .on(
                "broadcast",
                { event: "new_message" },
                (payload) => {
                    setMessages((prev) => [...prev, payload.payload]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isStreamOpen, channelId]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !user) return;

        setIsSending(true);
        const newMessage = {
            id: crypto.randomUUID(),
            userId: user.id,
            firstName: user.firstName || "Unknown",
            imageUrl: user.imageUrl,
            text: inputText.trim(),
            createdAt: new Date().toISOString(),
        };

        // Optimistically update UI
        setMessages((prev) => [...prev, newMessage]);
        setInputText("");

        // Broadcast to Supabase
        const channel = supabase.channel(`stream:${channelId}`);
        await channel.send({
            type: "broadcast",
            event: "new_message",
            payload: newMessage,
        });

        setIsSending(false);
    };

    if (!isStreamOpen) return null;

    return (
        <aside className="border-l border-border bg-card w-[320px] h-full flex flex-col shadow-[-8px_0_30px_rgb(0,0,0,0.02)] fixed right-0 top-0 bottom-0 z-50 animate-in slide-in-from-right-full duration-300">
            {/* Stream Header */}
            <div className="h-14 border-b border-border flex items-center justify-between px-4 sticky top-0 bg-card z-10">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-brand/10 text-brand flex items-center justify-center">
                        <MessageSquare className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-semibold text-sm text-foreground">The Stream</span>
                    <span className="text-xs text-muted-foreground ml-1">#{channelId.substring(0, 6)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors">
                        <Users className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={toggleStream}
                        className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground/60 space-y-2">
                        <MessageSquare className="h-8 w-8 opacity-20" />
                        <p className="text-sm">No messages yet in this Plot context.</p>
                        <p className="text-xs">Send a message to start The Stream.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="flex gap-2">
                            <Avatar className="h-7 w-7 shrink-0">
                                <AvatarImage src={msg.imageUrl} />
                                <AvatarFallback className="text-[10px] bg-brand text-white">
                                    {msg.firstName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 pl-0.5">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-semibold text-[13px] text-foreground">
                                        {msg.firstName}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-[13px] text-foreground/90 mt-0.5 leading-snug break-words">
                                    {msg.text}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-border bg-card">
                <form onSubmit={sendMessage} className="relative flex items-end bg-background border border-border rounded-xl focus-within:ring-2 ring-brand/20 transition-all p-1">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Message The Stream..."
                        className="w-full flex-1 max-h-32 min-h-[36px] bg-transparent border-none resize-none text-[13px] text-foreground focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60 px-2 py-2"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isSending}
                        className="h-8 w-8 shrink-0 bg-brand text-white rounded-lg flex items-center justify-center hover:bg-brand/90 transition-colors disabled:opacity-50 mx-0.5 mb-0.5"
                    >
                        {isSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    </button>
                </form>
            </div>
        </aside>
    );
}
