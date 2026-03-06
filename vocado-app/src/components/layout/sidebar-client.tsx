"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import * as LucideIcons from "lucide-react";
import {
    Search,
    LayoutDashboard,
    MessageCircle,
    Mail,
    CalendarDays,
    Building2,
    Users,
    ChevronRight,
    ChevronDown,
    FolderOpen,
    FileText,
    Plus,
    MoreHorizontal,
    Lock,
    Settings,
    HelpCircle,
    Folder,
    Edit,
    Trash2,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { createTeamspace, deleteFolder, renameFolder, deletePlot, renamePlot } from "@/app/actions/teamspace";
import { CreateFolderDialog } from "./create-folder-dialog";
import { CreatePlotDialog } from "./create-plot-dialog";

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface PlotData {
    id: string;
    name: string;
    emoji?: string | null;
    color?: string | null;
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
    members?: Array<{ role: "ADMIN" | "MEMBER" }>;
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
    
    // Dialog states
    const [createFolderDialog, setCreateFolderDialog] = React.useState<{ open: boolean; teamspaceId: string | null }>({ open: false, teamspaceId: null });
    const [createPlotDialog, setCreatePlotDialog] = React.useState<{ open: boolean; teamspaceId: string | null; folderId: string | null; isPrivate: boolean }>({ open: false, teamspaceId: null, folderId: null, isPrivate: false });

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

    const renderPlot = (plot: PlotData, canManage: boolean) => (
        <div
            key={plot.id}
            onClick={() => navigateTo(`/workspace/${workspaceId}/plot/${plot.id}`)}
            className={cn(
                "group flex w-full items-center gap-2 rounded-lg px-6 py-[8px] text-[12px] font-normal transition-all duration-150 cursor-pointer",
                "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
        >
            <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: plot.color || "#3b82f6" }}
            />
            <span className="flex-1 truncate text-left">{plot.name}</span>

            {canManage && (
                <div className="opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center justify-center h-5 w-5 rounded hover:bg-muted">
                                <MoreHorizontal className="h-3 w-3 text-[oklch(0.55_0.04_135)]" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    const newName = prompt("Rename plot", plot.name);
                                    if (!newName || !newName.trim()) return;
                                    await renamePlot(workspaceId, plot.id, newName.trim());
                                }}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (confirm(`Delete plot \"${plot.name}\"?`)) {
                                        await deletePlot(workspaceId, plot.id);
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Plot
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );

    const renderFolder = (folder: FolderData, parentTeamspaceId: string, canManage: boolean) => {
        const isOpen = expandedFolders.has(folder.id);
        const tsId = folder.teamspaceId ?? parentTeamspaceId;
        return (
            <div key={folder.id} className="group">
                <div
                    onClick={() => toggleFolder(folder.id)}
                    className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-4 py-[10px] text-[12px] font-medium transition-all duration-150 cursor-pointer",
                        isOpen
                            ? "bg-secondary/40 text-[#c855aa]"
                            : "text-foreground hover:bg-muted/50"
                    )}
                >
                    <FolderOpen className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate text-left">{folder.name}</span>
                    <ChevronRight
                        className={cn(
                            "h-4 w-4 shrink-0 transition-transform duration-200",
                            isOpen ? "rotate-90" : ""
                        )}
                    />
                    {canManage && (
                    <div className="opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center justify-center h-5 w-5 rounded hover:bg-muted">
                                    <MoreHorizontal className="h-3 w-3 text-[oklch(0.55_0.04_135)]" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCreatePlotDialog({ open: true, teamspaceId: tsId, folderId: folder.id, isPrivate: false });
                                    }}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Create Plot
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    const newName = prompt("Rename folder", folder.name);
                                    if (!newName || !newName.trim()) return;
                                    void renameFolder(workspaceId, folder.id, newName.trim());
                                }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Rename Folder
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (confirm(`Delete folder "${folder.name}"? This will also delete all plots inside.`)) {
                                            await deleteFolder(workspaceId, folder.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Folder
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    )}
                </div>
                {isOpen && (
                    <div className="ml-5 flex flex-col gap-0.5 border-l border-[oklch(0.93_0.01_130)] pl-2">
                        {folder.plots.map((plot) => renderPlot(plot, canManage))}
                        {/* Add Plot button inside folder */}
                        {canManage && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCreatePlotDialog({ open: true, teamspaceId: tsId, folderId: folder.id, isPrivate: false });
                                }}
                                className="flex items-center gap-1.5 rounded-lg px-2 py-[5px] text-[11px] font-medium text-[oklch(0.6_0.04_135)] transition-colors hover:bg-[oklch(0.97_0.01_135)] hover:text-[oklch(0.45_0.04_135)]"
                            >
                                <Plus className="h-3 w-3" />
                                <span>New Plot</span>
                            </button>
                        )}
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
                className="group flex w-full items-center justify-between px-4 py-3 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
                <div className="flex items-center gap-2">
                    {sectionLabel}
                    {isPrivate && <Lock className="h-3 w-3" />}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                    <Plus
                        className="h-4 w-4 hover:text-foreground transition-colors"
                        onClick={async (e) => {
                            e.stopPropagation();
                            await createTeamspace(workspaceId, { name: "New Teamspace" });
                        }}
                    />
                </div>
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
                            const canManageTeamspace = isAdmin || ts.members?.some((m) => m.role === "ADMIN");
                            return (
                                <div key={ts.id} className="group">
                                    <div
                                        onClick={() => toggleTeamspace(ts.id)}
                                        className="flex w-full items-center gap-1.5 rounded-xl px-2 py-[7px] text-[13px] font-medium text-[oklch(0.3_0.04_135)] transition-all duration-150 hover:bg-[oklch(0.96_0.015_135)] cursor-pointer"
                                    >
                                        <ChevronRight
                                            className={cn(
                                                "h-3 w-3 shrink-0 text-[oklch(0.55_0.04_135)] transition-transform duration-200",
                                                isExpanded && "rotate-90"
                                            )}
                                        />
                                        {(() => {
                                            if (ts.emoji && ts.emoji !== "📁") {
                                                const IconComponent = (LucideIcons as any)[ts.emoji];
                                                if (IconComponent) {
                                                    return <IconComponent className="h-4 w-4 shrink-0" />;
                                                }
                                            }
                                            return <Folder className="h-4 w-4 shrink-0" />;
                                        })()}
                                        <span className="flex-1 truncate text-left">{ts.name}</span>
                                        {canManageTeamspace && (
                                        <div className="opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="flex items-center justify-center h-5 w-5 rounded hover:bg-muted">
                                                        <Plus className="h-3 w-3 text-[oklch(0.55_0.04_135)]" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    {!isPrivate && (
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setCreateFolderDialog({ open: true, teamspaceId: ts.id });
                                                            }}
                                                        >
                                                            <FolderOpen className="h-4 w-4 mr-2" />
                                                            New Folder
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCreatePlotDialog({ open: true, teamspaceId: ts.id, folderId: null, isPrivate });
                                                        }}
                                                    >
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        New Plot
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        )}
                                    </div>
                                    {isExpanded && (
                                        <div className="ml-4 flex flex-col gap-0.5 border-l border-[oklch(0.93_0.01_130)] pl-2">
                                            {ts.folders.map((f) => renderFolder(f, ts.id, !!canManageTeamspace))}
                                            {ts.plots.map((plot) => renderPlot(plot, !!canManageTeamspace))}
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
        <aside className="flex h-full w-[280px] shrink-0 flex-col bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden border border-border pb-4">
            {/* A. Workspace Switcher */}
            <WorkspaceSwitcher
                workspaces={workspaces}
                currentWorkspaceId={workspaceId}
            />

            {/* B. Section 1: Global Modules */}
            <nav className="flex flex-col gap-1 px-4 py-4">
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
                                            return;
                                        }
                                        navigateTo(mod.href);
                                    }}
                                    className={cn(
                                        "group flex items-center gap-3.5 rounded-full px-5 py-[12px] text-[13px] font-medium transition-all duration-200",
                                        active
                                            ? "bg-[#1e2631] text-white shadow-sm"
                                            : "text-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <mod.icon
                                        className={cn(
                                            "h-5 w-5 shrink-0 transition-colors",
                                            active
                                                ? "text-white"
                                                : "text-muted-foreground group-hover:text-foreground"
                                        )}
                                    />
                                    <span className="flex-1 text-left">{mod.label}</span>
                                    {mod.badge && (
                                        <Badge className="h-5 min-w-5 justify-center rounded-full bg-secondary/20 px-1.5 text-[10px] font-semibold text-secondary-foreground border-0">
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
            <div className="flex-1 overflow-y-auto scrollbar-thin px-2 mt-4">
                {renderTeamspaceSection(
                    teamspaceTree,
                    "Spaces",
                    teamspacesOpen,
                    setTeamspacesOpen,
                    false
                )}

                {/* D. Section 3: My Space (Private) */}
                {renderTeamspaceSection(
                    mySpaceTree,
                    "Docs",
                    mySpaceOpen,
                    setMySpaceOpen,
                    true
                )}
            </div>

            {/* Modals */}
            <CreateFolderDialog
                open={createFolderDialog.open}
                onOpenChange={(open) => setCreateFolderDialog({ open, teamspaceId: null })}
                workspaceId={workspaceId}
                teamspaceId={createFolderDialog.teamspaceId || ""}
            />
            <CreatePlotDialog
                open={createPlotDialog.open}
                onOpenChange={(open) => setCreatePlotDialog({ open: false, teamspaceId: null, folderId: null, isPrivate: false })}
                workspaceId={workspaceId}
                teamspaceId={createPlotDialog.teamspaceId || ""}
                folderId={createPlotDialog.folderId}
                isPrivate={createPlotDialog.isPrivate}
            />
        </aside>
    );
}
