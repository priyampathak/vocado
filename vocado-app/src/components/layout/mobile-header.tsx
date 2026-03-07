"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ChevronDown, Check, Search } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface WorkspaceItem {
    id: string;
    name: string;
    role: string;
    inviteCode: string;
}

interface MobileHeaderProps {
    workspaces: WorkspaceItem[];
    currentWorkspaceId: string;
}

export function MobileHeader({ workspaces, currentWorkspaceId }: MobileHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = React.useState(false);
    const [open, setOpen] = useState(false);
    const [, startTransition] = useTransition();

    React.useEffect(() => setMounted(true), []);

    const current = workspaces.find((w) => w.id === currentWorkspaceId);

    const getTitle = () => {
        const base = `/workspace/${currentWorkspaceId}`;
        if (pathname === base) return "Dashboard";
        if (pathname.startsWith(`${base}/chat`)) return "Chat";
        if (pathname.startsWith(`${base}/mailbox`)) return "Mailbox";
        if (pathname.startsWith(`${base}/notifications`)) return "Notifications";
        if (pathname.startsWith(`${base}/calendar`)) return "Calendar";
        if (pathname.startsWith(`${base}/workspaces`)) return "Workspaces";
        if (pathname.startsWith(`${base}/teamspaces`)) return "Teamspaces";
        return "Vocado";
    };

    const switchWorkspace = (id: string) => {
        setOpen(false);
        startTransition(() => {
            router.push(`/workspace/${id}`);
        });
    };

    return (
        <header
            className="sticky top-0 z-40 flex h-14 w-full items-center justify-between px-4 md:hidden"
            style={{
                background: "rgba(243, 242, 236, 0.85)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
            }}
        >
            {/* Left: Profile + Workspace Switcher */}
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 focus-visible:outline-none active:opacity-80 transition-opacity">
                        <div className="flex h-9 w-9 items-center justify-center">
                            {mounted ? (
                                <UserButton
                                    appearance={{
                                        elements: {
                                            avatarBox: "h-9 w-9 ring-2 ring-white/80 shadow-sm",
                                        },
                                    }}
                                />
                            ) : (
                                <div className="h-9 w-9 rounded-full bg-[#e7e6df] animate-pulse" />
                            )}
                        </div>
                        <ChevronDown
                            className={cn(
                                "h-3.5 w-3.5 text-slate/40 transition-transform duration-200",
                                open && "rotate-180"
                            )}
                        />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="start"
                    sideOffset={8}
                    className="w-[220px] rounded-2xl border-[oklch(0.93_0.01_130)] bg-white p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                >
                    <div className="px-2 py-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[oklch(0.55_0.04_135)]">
                            Switch Workspace
                        </p>
                    </div>

                    {workspaces.map((ws) => (
                        <DropdownMenuItem
                            key={ws.id}
                            onClick={() => switchWorkspace(ws.id)}
                            className={cn(
                                "flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[14px] font-medium cursor-pointer transition-all duration-150",
                                ws.id === currentWorkspaceId
                                    ? "bg-slate/6 text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                                    ws.id === currentWorkspaceId
                                        ? "bg-[#ff6b00] text-white shadow-sm"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                {ws.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="flex-1 truncate">{ws.name}</span>
                            {ws.id === currentWorkspaceId && (
                                <Check className="h-3.5 w-3.5 text-[#ff6b00]" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Center: Page title */}
            <h1 className="text-[17px] font-bold tracking-tight text-slate">
                {getTitle()}
            </h1>

            {/* Right: Search */}
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/60 shadow-sm border border-white/40">
                <Search className="h-4 w-4 text-slate/60" />
            </button>
        </header>
    );
}
