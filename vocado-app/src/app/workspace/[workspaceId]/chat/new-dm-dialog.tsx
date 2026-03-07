"use client";

import React, { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X, Users, MessageCircle } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { getOrCreateDM, createGroupDM } from "@/app/actions/chat";

interface NewDMDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
    onConversationCreated: (conversationId: string) => void;
}

export function NewDMDialog({
    open,
    onOpenChange,
    workspaceId,
    onConversationCreated,
}: NewDMDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [groupName, setGroupName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { workspaceMembers, conversations, setConversations } = useChatStore();

    const filteredMembers = useMemo(() => {
        return workspaceMembers
            .filter((m) => !m.isSelf)
            .filter((m) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                    m.name.toLowerCase().includes(q) ||
                    m.email.toLowerCase().includes(q)
                );
            });
    }, [workspaceMembers, searchQuery]);

    const selectedMembers = workspaceMembers.filter((m) =>
        selectedUserIds.includes(m.userId)
    );

    const isGroupDM = selectedUserIds.length > 1;

    const toggleUser = (userId: string) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
        setError(null);
    };

    const handleCreate = async () => {
        if (selectedUserIds.length === 0) {
            setError("Select at least one person");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            let conv: any;

            if (selectedUserIds.length === 1) {
                conv = await getOrCreateDM(workspaceId, selectedUserIds[0]);
            } else {
                conv = await createGroupDM(
                    workspaceId,
                    selectedUserIds,
                    groupName.trim() || undefined
                );
            }

            setConversations([
                ...conversations.filter((c) => c.id !== conv.id),
                {
                    id: conv.id,
                    type: conv.type,
                    name:
                        conv.name ||
                        conv.members
                            .filter((m: any) => !workspaceMembers.find((wm) => wm.userId === m.userId && wm.isSelf))
                            .map((m: any) => m.user.name.split(" ")[0])
                            .join(", ") ||
                        "Conversation",
                    description: null,
                    visibility: null,
                    lastMessageAt: null,
                    lastMessageText: null,
                    lastSenderId: null,
                    lastReadAt: new Date(),
                    members: conv.members.map((m: any) => ({
                        userId: m.user.id,
                        clerkId: m.user.clerkId,
                        name: m.user.name,
                        avatarUrl: m.user.avatarUrl,
                    })),
                    otherMembers: conv.members
                        .filter((m: any) => !workspaceMembers.find((wm) => wm.userId === m.userId && wm.isSelf))
                        .map((m: any) => ({
                            userId: m.user.id,
                            clerkId: m.user.clerkId,
                            name: m.user.name,
                            avatarUrl: m.user.avatarUrl,
                        })),
                    createdAt: conv.createdAt,
                },
            ]);

            onConversationCreated(conv.id);
            resetForm();
        } catch (err: any) {
            setError(err.message || "Failed to create conversation");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setSearchQuery("");
        setSelectedUserIds([]);
        setGroupName("");
        setError(null);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                if (!o) resetForm();
                onOpenChange(o);
            }}
        >
            <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isGroupDM ? (
                            <Users className="h-5 w-5 text-[oklch(0.55_0.14_135)]" />
                        ) : (
                            <MessageCircle className="h-5 w-5 text-[oklch(0.55_0.14_135)]" />
                        )}
                        {isGroupDM ? "New Group Message" : "New Message"}
                    </DialogTitle>
                    <DialogDescription>
                        {isGroupDM
                            ? `Select up to 8 people for a group conversation`
                            : "Start a direct message with a workspace member"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                    {/* Selected Chips */}
                    {selectedMembers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {selectedMembers.map((m) => (
                                <Badge
                                    key={m.userId}
                                    variant="secondary"
                                    className="gap-1 pr-1 py-1"
                                >
                                    <span className="text-xs">{m.name}</span>
                                    <button
                                        onClick={() => toggleUser(m.userId)}
                                        className="rounded-full hover:bg-muted p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Group name (shown for 2+ selected) */}
                    {isGroupDM && (
                        <div className="space-y-1.5">
                            <Label className="text-xs">Group Name (optional)</Label>
                            <Input
                                placeholder="e.g., Design Team"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="h-9"
                            />
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                            autoFocus
                        />
                    </div>

                    {/* Member List */}
                    <div className="flex-1 overflow-y-auto border rounded-lg -mx-0.5">
                        {filteredMembers.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No members found
                            </div>
                        ) : (
                            filteredMembers.map((member) => {
                                const isSelected = selectedUserIds.includes(member.userId);
                                return (
                                    <button
                                        key={member.userId}
                                        onClick={() => toggleUser(member.userId)}
                                        disabled={
                                            !isSelected && selectedUserIds.length >= 7
                                        }
                                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors disabled:opacity-40"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            readOnly
                                            className="rounded"
                                        />
                                        <Avatar className="h-8 w-8">
                                            {member.avatarUrl && (
                                                <AvatarImage src={member.avatarUrl} />
                                            )}
                                            <AvatarFallback className="text-[10px] font-bold bg-linear-to-br from-[oklch(0.55_0.14_135)] to-[oklch(0.7_0.12_115)] text-white">
                                                {member.name
                                                    .split(" ")
                                                    .map((w) => w[0])
                                                    .join("")
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {member.email}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {error && (
                        <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">
                            {error}
                        </p>
                    )}
                </div>

                <DialogFooter className="mt-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={isLoading || selectedUserIds.length === 0}
                    >
                        {isLoading
                            ? "Creating..."
                            : isGroupDM
                            ? "Create Group"
                            : "Open Chat"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
