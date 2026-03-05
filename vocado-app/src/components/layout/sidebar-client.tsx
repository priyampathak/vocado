"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import {
    Search,
    LayoutDashboard,
    MessageCircle,
    Mail,
    CalendarDays,
    Building2,
    Users,
    ChevronRight,
    FolderOpen,
    FileText,
    Plus,
    MoreHorizontal,
    Lock,
    Settings,
    HelpCircle,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { createTeamspace, createFolder, createPlot } from "@/app/actions/teamspace";

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface PlotData {
    id: string;
    name: string;
    emoji?: string | null;
}

interface FolderData {
    id: string;
    name: string;
    emoji?: string | null;
    teamspaceId?: string;
    plots: PlotData[];
}

interface TeamspaceData {
    id: string;
    name: string;
    emoji?: string | null;
    folders: FolderData[];
    plots: PlotData[];
}

interface WorkspaceItem {
    id: string;
    name: string;
    role: string;
    inviteCode: string;
}

interface SidebarClientProps {
    workspaces: WorkspaceItem[];
    workspaceId: string;
    userRole: string | null;
    teamspaceTree: TeamspaceData[];
    mySpaceTree: TeamspaceData[];
}

// ──────────────────────────────────────────
// Global Module Items
// ──────────────────────────────────────────

interface ModuleItem {
    icon: React.ElementType;
    label: string;
    href: string;
    badge?: number;
    adminOnly?: boolean;
}

function getModules(workspaceId: string): ModuleItem[] {
    return [
        { icon: Search, label: "Search", href: "#search" },
        { icon: LayoutDashboard, label: "Dashboard", href: `/workspace/${workspaceId}` },
        { icon: MessageCircle, label: "Chat", href: `/workspace/${workspaceId}/chat` },
        { icon: Mail, label: "Mailbox", href: `/workspace/${workspaceId}/mailbox` },
        { icon: CalendarDays, label: "Calendar", href: `/workspace/${workspaceId}/calendar` },
        { icon: Building2, label: "Workspaces", href: `/workspace/${workspaceId}/workspaces`, adminOnly: true },
        { icon: Users, label: "Teamspaces", href: `/workspace/${workspaceId}/teamspaces` },
    ];
}

// ──────────────────────────────────────────
// Component
// ──────────────────────────────────────────

export function SidebarClient({
    workspaces,
    workspaceId,
    userRole,
    teamspaceTree,
    mySpaceTree,
}: SidebarClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [teamspacesOpen, setTeamspacesOpen] = useState(true);
    const [mySpaceOpen, setMySpaceOpen] = useState(true);
    const [expandedTeamspaces, setExpandedTeamspaces] = useState<Set<string>>(new Set());
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [isPending, startTransition] = useTransition();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    const modules = getModules(workspaceId);
    const isAdmin = userRole === "OWNER" || userRole === "ADMIN";

    const toggleTeamspace = (id: string) => {
        setExpandedTeamspaces((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleFolder = (id: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const navigateTo = (href: string) => {
        startTransition(() => router.push(href));
    };

    const isActiveRoute = (href: string) => {
        if (href === "#search") return false;
        if (href === `/workspace/${workspaceId}`) return pathname === href;
        return pathname.startsWith(href);
    };

    // ──────────────────────────────────────────
    // Render Tree Nodes
    // ──────────────────────────────────────────

    const renderPlot = (plot: PlotData) => (
        <button
            key={plot.id}
            onClick={() => navigateTo(`/workspace/${workspaceId}/plot/${plot.id}`)}
            className={cn(
                "group flex w-full items-center gap-2 rounded-lg px-2 py-[6px] text-[12.5px] font-medium transition-all duration-150",
                "text-[oklch(0.45_0.03_135)] hover:bg-[oklch(0.96_0.015_135)] hover:text-[oklch(0.25_0.03_135)]"
            )}
        >
            <FileText className="h-3.5 w-3.5 shrink-0 text-[oklch(0.6_0.04_135)]" />
            <span className="flex-1 truncate text-left">{plot.emoji ?? "📄"} {plot.name}</span>
        </button>
    );

    const renderFolder = (folder: FolderData, parentTeamspaceId: string) => {
        const isOpen = expandedFolders.has(folder.id);
        const tsId = folder.teamspaceId ?? parentTeamspaceId;
        return (
            <div key={folder.id}>
                <button
                    onClick={() => toggleFolder(folder.id)}
                    className="group flex w-full items-center gap-1.5 rounded-lg px-2 py-[6px] text-[12.5px] font-medium text-[oklch(0.4_0.03_135)] transition-all duration-150 hover:bg-[oklch(0.96_0.015_135)]"
                >
                    <ChevronRight
                        className={cn(
                            "h-3 w-3 shrink-0 text-[oklch(0.6_0.04_135)] transition-transform duration-200",
                            isOpen && "rotate-90"
                        )}
                    />
                    <FolderOpen className="h-3.5 w-3.5 shrink-0 text-[oklch(0.55_0.09_60)]" />
                    <span className="flex-1 truncate text-left">{folder.emoji ?? "📂"} {folder.name}</span>
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <Plus
                            className="h-3 w-3 text-[oklch(0.55_0.04_135)] hover:text-[oklch(0.35_0.04_135)]"
                            onClick={async (e) => {
                                e.stopPropagation();
                                await createPlot(workspaceId, tsId, "Untitled Plot", { folderId: folder.id });
                            }}
                        />
                    </div>
                </button>
                {isOpen && (
                    <div className="ml-5 flex flex-col gap-0.5 border-l border-[oklch(0.93_0.01_130)] pl-2">
                        {folder.plots.map(renderPlot)}
                    </div>
                )}
            </div>
        );
    };

    const renderTeamspaceSection = (
        tree: TeamspaceData[],
        sectionLabel: string,
        isOpen: boolean,
        setOpen: (v: boolean) => void,
        isPrivate: boolean
    ) => (
        <div className="px-2.5">
            <button
                onClick={() => setOpen(!isOpen)}
                className="group flex w-full items-center gap-1.5 px-2 py-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[oklch(0.55_0.04_135)] transition-colors hover:text-[oklch(0.35_0.04_135)]"
            >
                <ChevronRight
                    className={cn(
                        "h-3 w-3 transition-transform duration-200",
                        isOpen && "rotate-90"
                    )}
                />
                {isPrivate && <Lock className="h-3 w-3 text-[oklch(0.6_0.04_135)]" />}
                <span className="flex-1 text-left">{sectionLabel}</span>
                {!isPrivate && (
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Plus
                            className="h-3.5 w-3.5 text-[oklch(0.55_0.04_135)] hover:text-[oklch(0.35_0.04_135)]"
                            onClick={async (e) => {
                                e.stopPropagation();
                                await createTeamspace(workspaceId, "New Teamspace");
                            }}
                        />
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="flex flex-col gap-0.5">
                    {tree.length === 0 ? (
                        <p className="px-4 py-3 text-[11px] text-[oklch(0.6_0.04_135)] italic">
                            {isPrivate ? "No private plots yet" : "No teamspaces yet"}
                        </p>
                    ) : (
                        tree.map((ts) => {
                            const isExpanded = expandedTeamspaces.has(ts.id);
                            return (
                                <div key={ts.id}>
                                    <button
                                        onClick={() => toggleTeamspace(ts.id)}
                                        className="group flex w-full items-center gap-1.5 rounded-xl px-2 py-[7px] text-[13px] font-semibold text-[oklch(0.3_0.04_135)] transition-all duration-150 hover:bg-[oklch(0.96_0.015_135)]"
                                    >
                                        <ChevronRight
                                            className={cn(
                                                "h-3 w-3 shrink-0 text-[oklch(0.55_0.04_135)] transition-transform duration-200",
                                                isExpanded && "rotate-90"
                                            )}
                                        />
                                        <span className="text-sm">{ts.emoji ?? "📁"}</span>
                                        <span className="flex-1 truncate text-left">{ts.name}</span>
                                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Plus
                                                className="h-3 w-3 text-[oklch(0.55_0.04_135)] hover:text-[oklch(0.35_0.04_135)]"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    await createPlot(workspaceId, ts.id, "Untitled Plot", { isPrivate });
                                                }}
                                            />
                                            <MoreHorizontal className="h-3 w-3 text-[oklch(0.55_0.04_135)]" />
                                        </div>
                                    </button>
                                    {isExpanded && (
                                        <div className="ml-4 flex flex-col gap-0.5 border-l border-[oklch(0.93_0.01_130)] pl-2">
                                            {ts.folders.map((f) => renderFolder(f, ts.id))}
                                            {ts.plots.map(renderPlot)}
                                            {/* Add Folder button */}
                                            {!isPrivate && (
                                                <button
                                                    onClick={async () => {
                                                        await createFolder(workspaceId, ts.id, "New Folder");
                                                    }}
                                                    className="flex items-center gap-1.5 rounded-lg px-2 py-[5px] text-[11px] font-medium text-[oklch(0.6_0.04_135)] transition-colors hover:bg-[oklch(0.97_0.01_135)] hover:text-[oklch(0.45_0.04_135)]"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    <span>New Folder</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );

    // ──────────────────────────────────────────
    // Main Render
    // ──────────────────────────────────────────

    return (
        <aside className="flex h-screen w-[260px] shrink-0 flex-col bg-white border-r border-[oklch(0.93_0.01_130)] shadow-[4px_0_30px_rgb(0,0,0,0.02)]">
            {/* A. Workspace Switcher */}
            <WorkspaceSwitcher
                workspaces={workspaces}
                currentWorkspaceId={workspaceId}
            />

            {/* B. Section 1: Global Modules */}
            <nav className="flex flex-col gap-0.5 px-2.5 py-1">
                {modules.map((mod) => {
                    if (mod.adminOnly && !isAdmin) return null;
                    const active = isActiveRoute(mod.href);
                    return (
                        <Tooltip key={mod.label} delayDuration={400}>
                            <TooltipTrigger asChild>
                                <button
                                    id={`sidebar-module-${mod.label.toLowerCase()}`}
                                    onClick={() => {
                                        if (mod.href === "#search") {
                                            // TODO: trigger Cmd+K modal
                                            return;
                                        }
                                        navigateTo(mod.href);
                                    }}
                                    className={cn(
                                        "group flex items-center gap-2.5 rounded-xl px-3 py-[8px] text-[13px] font-medium transition-all duration-200",
                                        active
                                            ? "bg-[oklch(0.96_0.025_135)] text-[oklch(0.25_0.05_135)] shadow-[0_1px_3px_rgb(0,0,0,0.04)]"
                                            : "text-[oklch(0.45_0.03_135)] hover:bg-[oklch(0.97_0.01_135)] hover:text-[oklch(0.3_0.04_135)]"
                                    )}
                                >
                                    <mod.icon
                                        className={cn(
                                            "h-4 w-4 shrink-0 transition-colors",
                                            active
                                                ? "text-[oklch(0.55_0.14_135)]"
                                                : "text-[oklch(0.6_0.04_135)] group-hover:text-[oklch(0.5_0.06_135)]"
                                        )}
                                    />
                                    <span className="flex-1 text-left">{mod.label}</span>
                                    {mod.badge && (
                                        <Badge className="h-5 min-w-5 justify-center rounded-full bg-[oklch(0.55_0.14_135)]/10 px-1.5 text-[10px] font-bold text-[oklch(0.55_0.14_135)] border-0">
                                            {mod.badge}
                                        </Badge>
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                                {mod.label}
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </nav>

            <Separator className="mx-4 my-2 w-auto bg-[oklch(0.93_0.01_130)]" />

            {/* C. Section 2: Teamspaces Tree */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                {renderTeamspaceSection(
                    teamspaceTree,
                    "Teamspaces",
                    teamspacesOpen,
                    setTeamspacesOpen,
                    false
                )}

                <Separator className="mx-4 my-2 w-auto bg-[oklch(0.93_0.01_130)]" />

                {/* D. Section 3: My Space (Private) */}
                {renderTeamspaceSection(
                    mySpaceTree,
                    "My Space",
                    mySpaceOpen,
                    setMySpaceOpen,
                    true
                )}
            </div>

            {/* Bottom Section */}
            <div className="mt-auto border-t border-[oklch(0.93_0.01_130)] bg-white/80 px-2.5 py-2">
                <div className="flex flex-col gap-0.5">
                    <button
                        onClick={() => navigateTo(`/workspace/${workspaceId}/settings`)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-[7px] text-[13px] font-medium text-[oklch(0.45_0.03_135)] transition-all duration-200 hover:bg-[oklch(0.97_0.01_135)] hover:text-[oklch(0.3_0.04_135)]"
                    >
                        <Settings className="h-4 w-4 text-[oklch(0.6_0.04_135)]" />
                        <span>Settings</span>
                    </button>
                    <button className="flex items-center gap-2.5 rounded-xl px-3 py-[7px] text-[13px] font-medium text-[oklch(0.45_0.03_135)] transition-all duration-200 hover:bg-[oklch(0.97_0.01_135)] hover:text-[oklch(0.3_0.04_135)]">
                        <HelpCircle className="h-4 w-4 text-[oklch(0.6_0.04_135)]" />
                        <span>Help Center</span>
                    </button>
                </div>

                <Separator className="my-2 bg-[oklch(0.93_0.01_130)]" />

                {/* User Profile */}
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2">
                    <div className="h-8 w-8 flex items-center justify-center">
                        {mounted ? (
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "h-7 w-7",
                                    },
                                }}
                            />
                        ) : (
                            <div className="h-7 w-7 rounded-full bg-[oklch(0.94_0.02_130)] animate-pulse" />
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}
