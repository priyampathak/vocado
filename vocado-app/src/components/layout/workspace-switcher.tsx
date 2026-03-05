"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ChevronDown,
    Check,
    Plus,
    Box,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface WorkspaceItem {
    id: string;
    name: string;
    role: string;
    inviteCode: string;
}

interface WorkspaceSwitcherProps {
    workspaces: WorkspaceItem[];
    currentWorkspaceId: string;
}

export function WorkspaceSwitcher({
    workspaces,
    currentWorkspaceId,
}: WorkspaceSwitcherProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const current = workspaces.find((w) => w.id === currentWorkspaceId);
    const initial = current?.name?.charAt(0)?.toUpperCase() ?? "V";

    const switchWorkspace = (id: string) => {
        setOpen(false);
        startTransition(() => {
            router.push(`/workspace/${id}`);
        });
    };

    return (
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl">
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <button
                        className={cn(
                            "flex w-full items-center gap-3 px-4 py-4 text-left transition-all duration-200",
                            "hover:bg-[oklch(0.97_0.01_135)] active:bg-[oklch(0.95_0.015_135)]",
                            "focus-visible:outline-none"
                        )}
                    >
                        {/* Logo Icon */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.55_0.14_135)] to-[oklch(0.7_0.12_115)] shadow-[0_2px_8px_rgb(0,0,0,0.08)]">
                            <Box className="h-4 w-4 text-white" />
                        </div>

                        {/* Workspace Name */}
                        <div className="flex flex-1 flex-col min-w-0">
                            <span className="text-[13px] font-bold tracking-tight text-[oklch(0.25_0.03_135)] truncate">
                                {current?.name ?? "Vocado OS"}
                            </span>
                            <span className="text-[10px] font-medium text-[oklch(0.6_0.04_135)] capitalize">
                                {current?.role?.toLowerCase() ?? "workspace"}
                            </span>
                        </div>

                        <ChevronDown
                            className={cn(
                                "h-3.5 w-3.5 shrink-0 text-[oklch(0.6_0.04_135)] transition-transform duration-200",
                                open && "rotate-180"
                            )}
                        />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="start"
                    sideOffset={4}
                    className="w-[240px] rounded-2xl border-[oklch(0.93_0.01_130)] bg-white p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
                >
                    <div className="px-2 py-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[oklch(0.6_0.04_135)]">
                            Workspaces
                        </p>
                    </div>

                    {workspaces.map((ws) => (
                        <DropdownMenuItem
                            key={ws.id}
                            onClick={() => switchWorkspace(ws.id)}
                            className={cn(
                                "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium cursor-pointer transition-all duration-150",
                                ws.id === currentWorkspaceId
                                    ? "bg-[oklch(0.96_0.02_130)] text-[oklch(0.25_0.03_135)]"
                                    : "text-[oklch(0.4_0.03_135)] hover:bg-[oklch(0.97_0.01_135)]"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                                    ws.id === currentWorkspaceId
                                        ? "bg-gradient-to-br from-[oklch(0.55_0.14_135)] to-[oklch(0.7_0.12_115)] text-white shadow-sm"
                                        : "bg-[oklch(0.94_0.02_130)] text-[oklch(0.45_0.04_135)]"
                                )}
                            >
                                {ws.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="flex-1 truncate">{ws.name}</span>
                            {ws.id === currentWorkspaceId && (
                                <Check className="h-3.5 w-3.5 text-[oklch(0.55_0.14_135)]" />
                            )}
                        </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator className="my-1 bg-[oklch(0.93_0.01_130)]" />

                    <DropdownMenuItem
                        onClick={() => {
                            setOpen(false);
                            router.push("/onboarding");
                        }}
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium text-[oklch(0.55_0.14_135)] cursor-pointer hover:bg-[oklch(0.96_0.02_130)]"
                    >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-[oklch(0.55_0.14_135)]/30">
                            <Plus className="h-3.5 w-3.5" />
                        </div>
                        <span>Create New Workspace</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
