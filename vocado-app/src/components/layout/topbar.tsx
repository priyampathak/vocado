"use client";

import React from "react";
import {
    Search,
    Bell,
    Filter,
    Share2,
    Plus,
    ChevronRight,
    MoreHorizontal,
    LayoutDashboard,
    AlignLeft,
    Calendar,
    Layout,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export function Topbar() {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="flex w-full flex-col border-b border-border bg-card">
            {/* Top Row */}
            <div className="flex items-center justify-between px-6 py-3">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-sm">
                    <span className="font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
                        Projects
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">
                            Adrian Bert - CRM Dashboard
                        </span>
                        <button className="rounded p-0.5 text-muted-foreground/60 transition-colors hover:bg-accent hover:text-muted-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Notification */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                    >
                        <Bell className="h-4 w-4" />
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white shadow-sm">
                            1
                        </span>
                    </Button>

                    {/* Share Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 rounded-lg border-border/80 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                    </Button>

                    <div className="ml-2 flex items-center justify-center h-8 w-8">
                        {mounted ? <UserButton /> : <div className="h-7 w-7 rounded-full bg-muted animate-pulse border border-border/50" />}
                    </div>
                </div>
            </div>

            {/* Bottom Row - Tabs & Actions */}
            <div className="flex items-center justify-between px-6 pb-0">
                {/* View Tabs */}
                <div className="flex items-center gap-1 mb-2">
                    {[
                        { label: "Spreadsheet", icon: <LayoutDashboard className="h-3.5 w-3.5" />, active: true },
                        { label: "Timeline", icon: <AlignLeft className="h-3.5 w-3.5" />, active: false },
                        { label: "Calendar", icon: <Calendar className="h-3.5 w-3.5" />, active: false },
                        { label: "Board", icon: <Layout className="h-3.5 w-3.5" />, active: false },
                    ].map((tab) => (
                        <button
                            key={tab.label}
                            className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors border ${tab.active
                                ? "border-border/60 bg-background text-foreground shadow-sm"
                                : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                    <button className="ml-1 flex items-center justify-center rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-muted/50 hover:text-foreground">
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-2 pb-1.5">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search task..."
                            className="h-8 w-[180px] rounded-lg border-border/60 bg-accent/50 pl-8 text-xs placeholder:text-muted-foreground/50 focus-visible:ring-brand/30"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 rounded-lg border-border/60 text-xs font-medium text-muted-foreground"
                    >
                        <Filter className="h-3.5 w-3.5" />
                        Filter
                    </Button>
                    <button className="rounded p-1 text-muted-foreground/60 transition-colors hover:bg-accent hover:text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}
