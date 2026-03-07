"use client";

import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Hash, Globe, Lock } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { createChannel, getPublicChannels, joinChannel } from "@/app/actions/chat";
import { cn } from "@/lib/utils";

interface CreateChannelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
    onChannelCreated: (conversationId: string) => void;
}

export function CreateChannelDialog({
    open,
    onOpenChange,
    workspaceId,
    onChannelCreated,
}: CreateChannelDialogProps) {
    const [tab, setTab] = useState<"create" | "browse">("create");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [publicChannels, setPublicChannels] = useState<any[]>([]);
    const [browseLoading, setBrowseLoading] = useState(false);

    const { conversations, setConversations } = useChatStore();

    useEffect(() => {
        if (open && tab === "browse") {
            loadPublicChannels();
        }
    }, [open, tab]);

    const loadPublicChannels = async () => {
        setBrowseLoading(true);
        try {
            const channels = await getPublicChannels(workspaceId);
            setPublicChannels(channels);
        } catch (err) {
            console.error("Failed to load channels:", err);
        } finally {
            setBrowseLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            setError("Channel name is required");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const conv = await createChannel(workspaceId, {
                name: name.trim(),
                description: description.trim() || undefined,
                visibility,
            });

            setConversations([
                ...conversations,
                {
                    id: conv.id,
                    type: "CHANNEL",
                    name: conv.name!,
                    description: conv.description,
                    visibility: conv.visibility,
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
                    otherMembers: [],
                    createdAt: conv.createdAt,
                },
            ]);

            onChannelCreated(conv.id);
            resetForm();
        } catch (err: any) {
            setError(err.message || "Failed to create channel");
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async (channelId: string) => {
        try {
            await joinChannel(workspaceId, channelId);
            onChannelCreated(channelId);
            onOpenChange(false);
        } catch (err: any) {
            alert(err.message || "Failed to join channel");
        }
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setVisibility("PUBLIC");
        setError(null);
        setTab("create");
    };

    const sanitizedPreview = name
        .toLowerCase()
        .replace(/[^a-z0-9-_\s]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 50);

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                if (!o) resetForm();
                onOpenChange(o);
            }}
        >
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Hash className="h-5 w-5 text-[oklch(0.55_0.14_135)]" />
                        Channels
                    </DialogTitle>
                    <DialogDescription>
                        Create a new channel or browse existing ones
                    </DialogDescription>
                </DialogHeader>

                {/* Tab switcher */}
                <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
                    {(["create", "browse"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={cn(
                                "flex-1 py-1.5 text-[12.5px] font-medium rounded-md transition-all capitalize",
                                tab === t
                                    ? "bg-white shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {t === "create" ? "Create New" : "Browse"}
                        </button>
                    ))}
                </div>

                {tab === "create" ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Channel Name <span className="text-destructive">*</span></Label>
                            <Input
                                placeholder="e.g., marketing"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                            {sanitizedPreview && (
                                <p className="text-[11px] text-muted-foreground">
                                    Preview: <span className="font-mono">#{sanitizedPreview}</span>
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="What's this channel about?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Visibility</Label>
                            <div className="flex gap-2">
                                {[
                                    { value: "PUBLIC", icon: Globe, label: "Public", desc: "Anyone in workspace can join" },
                                    { value: "PRIVATE", icon: Lock, label: "Private", desc: "Invite only" },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setVisibility(opt.value as "PUBLIC" | "PRIVATE")}
                                        className={cn(
                                            "flex-1 flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left",
                                            visibility === opt.value
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-muted-foreground/30"
                                        )}
                                    >
                                        <opt.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <div>
                                            <p className="text-[13px] font-medium">{opt.label}</p>
                                            <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">
                                {error}
                            </p>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={isLoading || !name.trim()}>
                                {isLoading ? "Creating..." : "Create Channel"}
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {browseLoading ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                Loading channels...
                            </div>
                        ) : publicChannels.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No public channels yet. Create one!
                            </div>
                        ) : (
                            publicChannels.map((ch) => (
                                <div
                                    key={ch.id}
                                    className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="h-9 w-9 rounded-lg bg-[oklch(0.92_0.04_135)] flex items-center justify-center text-[oklch(0.45_0.08_135)]">
                                            <Hash className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                #{ch.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {ch.memberCount} member{ch.memberCount !== 1 ? "s" : ""}
                                            </p>
                                        </div>
                                    </div>
                                    {ch.isMember ? (
                                        <Badge variant="secondary" className="text-xs">
                                            Joined
                                        </Badge>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleJoin(ch.id)}
                                        >
                                            Join
                                        </Button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
