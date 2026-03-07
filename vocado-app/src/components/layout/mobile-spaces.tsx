"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import * as LucideIcons from "lucide-react";
import {
    X,
    ChevronRight,
    Folder,
    FolderOpen,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    folders: FolderData[];
    plots: PlotData[];
}

interface MobileSpacesProps {
    open: boolean;
    onClose: () => void;
    teamspaceTree: TeamspaceData[];
    mySpaceTree: TeamspaceData[];
}

export function MobileSpaces({ open, onClose, teamspaceTree, mySpaceTree }: MobileSpacesProps) {
    const router = useRouter();
    const params = useParams();
    const workspaceId = params.workspaceId as string;
    const [expandedTs, setExpandedTs] = useState<Set<string>>(new Set());
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    if (!open) return null;

    const toggleTs = (id: string) => {
        setExpandedTs((prev) => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    const toggleFolder = (id: string) => {
        setExpandedFolders((prev) => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    const openPlot = (plotId: string) => {
        router.push(`/workspace/${workspaceId}/plot/${plotId}`);
        onClose();
    };

    const renderPlot = (plot: PlotData) => (
        <button
            key={plot.id}
            onClick={() => openPlot(plot.id)}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all active:scale-[0.98] active:bg-white/60"
        >
            <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: plot.color || "#3b82f6" }}
            />
            <span className="text-[14px] font-medium text-slate/80 truncate">{plot.name}</span>
        </button>
    );

    const renderFolder = (folder: FolderData) => {
        const isOpen = expandedFolders.has(folder.id);
        return (
            <div key={folder.id}>
                <button
                    onClick={() => toggleFolder(folder.id)}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all active:scale-[0.98]"
                >
                    <FolderOpen className="h-5 w-5 shrink-0 text-slate/40" />
                    <span className="flex-1 text-[14px] font-semibold text-slate/70 truncate">{folder.name}</span>
                    <ChevronRight className={cn("h-4 w-4 text-slate/30 transition-transform duration-200", isOpen && "rotate-90")} />
                </button>
                {isOpen && (
                    <div className="ml-6 border-l border-slate/8 pl-3">
                        {folder.plots.map(renderPlot)}
                    </div>
                )}
            </div>
        );
    };

    const renderSection = (tree: TeamspaceData[], label: string) => (
        <div className="mt-4">
            <p className="px-4 pb-2 text-[11px] font-bold uppercase tracking-widest text-slate/30">{label}</p>
            {tree.length === 0 ? (
                <p className="px-4 py-6 text-center text-[13px] text-slate/30 italic">Nothing here yet</p>
            ) : (
                tree.map((ts) => {
                    const isOpen = expandedTs.has(ts.id);
                    const IconComp = ts.emoji && ts.emoji !== "📁"
                        ? (LucideIcons as any)[ts.emoji] || Folder
                        : Folder;
                    return (
                        <div key={ts.id}>
                            <button
                                onClick={() => toggleTs(ts.id)}
                                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all active:scale-[0.98]"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/60 shadow-sm border border-white/40">
                                    <IconComp className="h-4.5 w-4.5 text-slate/50" />
                                </div>
                                <span className="flex-1 text-[15px] font-semibold text-slate truncate">{ts.name}</span>
                                <ChevronRight className={cn("h-4 w-4 text-slate/25 transition-transform duration-200", isOpen && "rotate-90")} />
                            </button>
                            {isOpen && (
                                <div className="ml-4">
                                    {ts.folders.map(renderFolder)}
                                    {ts.plots.map(renderPlot)}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-60 md:hidden animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div
                className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-[28px] pb-24 animate-in slide-in-from-bottom duration-300"
                style={{
                    background: "rgba(243, 242, 236, 0.92)",
                    backdropFilter: "blur(40px) saturate(200%)",
                    WebkitBackdropFilter: "blur(40px) saturate(200%)",
                    boxShadow: "0 -16px 48px rgba(0,0,0,0.1)",
                }}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between px-5 pt-4 pb-2"
                    style={{
                        background: "rgba(243, 242, 236, 0.92)",
                        backdropFilter: "blur(40px)",
                        WebkitBackdropFilter: "blur(40px)",
                    }}
                >
                    <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate/15" />
                </div>
                <div className="flex items-center justify-between px-5 pb-2">
                    <h2 className="text-[20px] font-bold text-slate">Spaces</h2>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate/8 active:bg-slate/15 transition-colors"
                    >
                        <X className="h-4 w-4 text-slate/50" />
                    </button>
                </div>

                <div className="px-2">
                    {renderSection(teamspaceTree, "Spaces")}
                    {renderSection(mySpaceTree, "Private Docs")}
                </div>
            </div>
        </div>
    );
}
