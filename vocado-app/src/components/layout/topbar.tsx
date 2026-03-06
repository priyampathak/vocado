"use client";

import React from "react";
import {
    Search,
    Bell,
    Settings,
    LogOut,
    User
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

import { useUser } from "@clerk/nextjs";

export function Topbar() {
    const [mounted, setMounted] = React.useState(false);
    const { user } = useUser();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="sticky top-0 z-10 flex h-20 w-full items-center justify-between border-b-0 bg-transparent px-8 py-4">
            {/* Left Box: Search Bar */}
            <div className="flex flex-1 items-center gap-6">
                <div className="relative flex w-[280px] items-center">
                    <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search"
                        className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-4 text-[14px] text-foreground placeholder:text-muted-foreground shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                    />
                </div>

                {/* User Actions */}
                <div className="flex items-center gap-3">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-border text-foreground hover:bg-muted transition-colors">
                        <Settings className="h-4 w-4" />
                    </button>
                    <button className="flex h-10 w-10 relative items-center justify-center rounded-full bg-white shadow-sm border border-border text-foreground hover:bg-muted transition-colors">
                        <Bell className="h-4 w-4" />
                        <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-secondary border border-white" />
                    </button>

                    <div className="ml-4 flex items-center gap-3">
                        {mounted && user?.fullName && (
                            <span className="text-[14px] font-semibold text-foreground">
                                {user.fullName}
                            </span>
                        )}
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
                            {mounted ? (
                                <UserButton
                                    appearance={{
                                        elements: {
                                            avatarBox: "h-10 w-10 ring-2 ring-white shadow-sm",
                                        },
                                    }}
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Extra Navigation */}
            <div className="flex items-center gap-6">
                <button className="text-[14px] font-medium text-foreground hover:text-black">
                    Agenda
                </button>
                <button className="flex items-center gap-2 text-[14px] font-medium text-foreground hover:text-black">
                    Mentions
                    <span className="flex h-5 items-center justify-center rounded-full bg-white border border-border px-1.5 text-[11px] font-bold text-foreground shadow-sm">
                        10
                    </span>
                </button>
                <button className="h-11 rounded-xl bg-[#1e2631] px-5 text-[14px] font-semibold text-white shadow-sm hover:bg-[#1e2631]/90 transition-colors">
                    Statistics
                </button>
            </div>
        </header>
    );
}
