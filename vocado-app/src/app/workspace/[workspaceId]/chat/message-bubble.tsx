"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChatMessage, WorkspaceMemberChat } from "@/store/useChatStore";

interface MessageBubbleProps {
    message: ChatMessage;
    isSelf: boolean;
    showAvatar: boolean;
    workspaceMembers: WorkspaceMemberChat[];
}

export function MessageBubble({
    message,
    isSelf,
    showAvatar,
    workspaceMembers,
}: MessageBubbleProps) {
    const time = new Date(message.createdAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const renderContent = () => {
        if (message.mentions.length === 0) return message.content;

        const parts: React.ReactNode[] = [];
        const regex = /@(\w+(?:\s\w+)?)/g;
        let lastIndex = 0;
        let match;

        const content = message.content;
        while ((match = regex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push(content.substring(lastIndex, match.index));
            }

            const mentionName = match[1];
            const member = workspaceMembers.find((m) =>
                m.name.toLowerCase().startsWith(mentionName.toLowerCase())
            );
            const isMentionValid = member && message.mentions.includes(member.userId);

            parts.push(
                <span
                    key={match.index}
                    className={cn(
                        "font-semibold rounded px-0.5",
                        isMentionValid
                            ? isSelf
                                ? "text-white/90 bg-white/20"
                                : "text-[oklch(0.45_0.14_135)] bg-[oklch(0.92_0.06_135)]"
                            : ""
                    )}
                >
                    @{mentionName}
                </span>
            );
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < content.length) {
            parts.push(content.substring(lastIndex));
        }

        return parts.length > 0 ? parts : content;
    };

    return (
        <div
            className={cn(
                "flex gap-2.5 group",
                isSelf ? "flex-row-reverse" : "",
                showAvatar ? "mt-3" : "mt-0.5"
            )}
        >
            {showAvatar ? (
                <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                    {message.sender.avatarUrl && (
                        <AvatarImage src={message.sender.avatarUrl} />
                    )}
                    <AvatarFallback
                        className={cn(
                            "text-[10px] font-bold",
                            isSelf
                                ? "bg-[oklch(0.55_0.14_135)] text-white"
                                : "bg-linear-to-br from-[oklch(0.65_0.1_200)] to-[oklch(0.55_0.12_220)] text-white"
                        )}
                    >
                        {message.sender.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            ) : (
                <div className="w-8 shrink-0" />
            )}
            <div
                className={cn(
                    "flex max-w-[70%] flex-col gap-0.5",
                    isSelf ? "items-end" : "items-start"
                )}
            >
                {showAvatar && (
                    <div className="flex items-baseline gap-2">
                        <span className="text-[12px] font-semibold text-[oklch(0.3_0.03_135)]">
                            {isSelf ? "You" : message.sender.name}
                        </span>
                        <span className="text-[10px] text-[oklch(0.6_0.04_135)]">
                            {time}
                        </span>
                    </div>
                )}
                <div
                    className={cn(
                        "rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap wrap-break-word",
                        isSelf
                            ? "rounded-tr-md bg-[oklch(0.55_0.14_135)] text-white"
                            : "rounded-tl-md bg-[oklch(0.97_0.008_135)] text-[oklch(0.25_0.03_135)] border border-[oklch(0.93_0.01_130)]",
                        message.optimistic ? "opacity-70" : ""
                    )}
                >
                    {renderContent()}
                </div>
                {!showAvatar && (
                    <span className="text-[9px] text-[oklch(0.65_0.04_135)] opacity-0 group-hover:opacity-100 transition-opacity">
                        {time}
                    </span>
                )}
            </div>
        </div>
    );
}
