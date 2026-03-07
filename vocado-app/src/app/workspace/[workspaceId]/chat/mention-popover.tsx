"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { WorkspaceMemberChat } from "@/store/useChatStore";

interface MentionPopoverProps {
    results: WorkspaceMemberChat[];
    activeIndex: number;
    onSelect: (member: WorkspaceMemberChat) => void;
}

export function MentionPopover({ results, activeIndex, onSelect }: MentionPopoverProps) {
    return (
        <div className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-[oklch(0.93_0.01_130)] bg-white shadow-lg overflow-hidden z-50">
            <div className="px-3 py-2 border-b border-[oklch(0.95_0.01_130)]">
                <p className="text-[11px] font-medium text-[oklch(0.5_0.04_135)]">
                    Members
                </p>
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
                {results.map((member, index) => (
                    <button
                        key={member.userId}
                        onClick={() => onSelect(member)}
                        onMouseEnter={() => {}}
                        className={cn(
                            "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                            index === activeIndex
                                ? "bg-[oklch(0.96_0.025_135)]"
                                : "hover:bg-[oklch(0.98_0.005_135)]"
                        )}
                    >
                        <Avatar className="h-7 w-7">
                            {member.avatarUrl && <AvatarImage src={member.avatarUrl} />}
                            <AvatarFallback className="text-[9px] font-bold bg-linear-to-br from-[oklch(0.55_0.14_135)] to-[oklch(0.7_0.12_115)] text-white">
                                {member.name
                                    .split(" ")
                                    .map((w) => w[0])
                                    .join("")
                                    .substring(0, 2)
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-[oklch(0.25_0.03_135)] truncate">
                                {member.name}
                            </p>
                            <p className="text-[11px] text-[oklch(0.55_0.04_135)] truncate">
                                {member.email}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
