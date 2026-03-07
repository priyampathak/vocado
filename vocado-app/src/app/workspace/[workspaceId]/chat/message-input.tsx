"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Send, Plus, Paperclip, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceMemberChat } from "@/store/useChatStore";
import { MentionPopover } from "./mention-popover";

interface MessageInputProps {
    onSend: (content: string, mentions: string[]) => void;
    onTyping: () => void;
    workspaceMembers: WorkspaceMemberChat[];
    isMobile?: boolean;
}

export function MessageInput({ onSend, onTyping, workspaceMembers, isMobile }: MessageInputProps) {
    const [value, setValue] = useState("");
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [mentionIndex, setMentionIndex] = useState(-1);
    const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const mentionResults = mentionQuery !== null
        ? workspaceMembers
              .filter((m) => !m.isSelf)
              .filter(
                  (m) =>
                      m.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
                      m.email.toLowerCase().includes(mentionQuery.toLowerCase())
              )
              .slice(0, 8)
        : [];

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setValue(newVal);
        onTyping();

        const cursor = e.target.selectionStart;
        const textBeforeCursor = newVal.substring(0, cursor);
        const atMatch = textBeforeCursor.match(/@(\w*)$/);

        if (atMatch) {
            setMentionQuery(atMatch[1]);
            setMentionIndex(0);
        } else {
            setMentionQuery(null);
            setMentionIndex(-1);
        }
    };

    const insertMention = useCallback(
        (member: WorkspaceMemberChat) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const cursor = textarea.selectionStart;
            const textBefore = value.substring(0, cursor);
            const textAfter = value.substring(cursor);
            const atStart = textBefore.lastIndexOf("@");

            const mentionText = `@${member.name.split(" ")[0]} `;
            const newValue = textBefore.substring(0, atStart) + mentionText + textAfter;

            setValue(newValue);
            setMentionQuery(null);
            setMentionIndex(-1);
            setSelectedMentions((prev) =>
                prev.includes(member.userId) ? prev : [...prev, member.userId]
            );

            setTimeout(() => {
                const newCursor = atStart + mentionText.length;
                textarea.focus();
                textarea.setSelectionRange(newCursor, newCursor);
            }, 0);
        },
        [value]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (mentionQuery !== null && mentionResults.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setMentionIndex((prev) =>
                    prev < mentionResults.length - 1 ? prev + 1 : 0
                );
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setMentionIndex((prev) =>
                    prev > 0 ? prev - 1 : mentionResults.length - 1
                );
                return;
            }
            if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                const selected = mentionResults[mentionIndex >= 0 ? mentionIndex : 0];
                if (selected) insertMention(selected);
                return;
            }
            if (e.key === "Escape") {
                setMentionQuery(null);
                return;
            }
        }

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        const trimmed = value.trim();
        if (!trimmed) return;

        const mentionedIds = selectedMentions.filter((uid) => {
            const member = workspaceMembers.find((m) => m.userId === uid);
            if (!member) return false;
            const firstName = member.name.split(" ")[0];
            return trimmed.includes(`@${firstName}`);
        });

        onSend(trimmed, mentionedIds);
        setValue("");
        setSelectedMentions([]);
        setMentionQuery(null);

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleComingSoon = () => {
        alert("Coming soon!");
    };

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = Math.min(textarea.scrollHeight, 128) + "px";
        }
    }, [value]);

    return (
        <div className={cn("border-t border-[oklch(0.93_0.01_130)] p-3 relative", isMobile && "pb-4")}>

            {mentionQuery !== null && mentionResults.length > 0 && (
                <MentionPopover
                    results={mentionResults}
                    activeIndex={mentionIndex}
                    onSelect={insertMention}
                />
            )}

            <div className="flex items-end gap-2 rounded-2xl border border-[oklch(0.93_0.01_130)] bg-[oklch(0.99_0.005_135)] px-3 py-2 focus-within:ring-2 focus-within:ring-[oklch(0.55_0.14_135)]/20 transition-all">
                <button
                    type="button"
                    onClick={handleComingSoon}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[oklch(0.55_0.04_135)] transition-colors hover:bg-[oklch(0.94_0.02_135)]"
                >
                    <Plus className="h-4 w-4" />
                </button>
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (@ to mention)"
                    rows={1}
                    className="flex-1 resize-none bg-transparent py-1.5 text-[13px] text-[oklch(0.25_0.03_135)] placeholder:text-[oklch(0.6_0.04_135)] outline-none max-h-32"
                />
                <div className="flex shrink-0 items-center gap-1">
                    <button
                        type="button"
                        onClick={handleComingSoon}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[oklch(0.55_0.04_135)] transition-colors hover:bg-[oklch(0.94_0.02_135)]"
                    >
                        <Paperclip className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handleComingSoon}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[oklch(0.55_0.04_135)] transition-colors hover:bg-[oklch(0.94_0.02_135)]"
                    >
                        <Smile className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!value.trim()}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.55_0.14_135)] text-white transition-all hover:bg-[oklch(0.5_0.14_135)] disabled:opacity-40"
                    >
                        <Send className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
