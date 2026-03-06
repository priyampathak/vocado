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

export function Topbar() {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-[oklch(0.93_0.01_130)] bg-white/80 px-6 backdrop-blur-xl">
            {/* Left Box (Empty for alignment or future use) */}
            <div className="flex w-1/3 items-center">
                {/* Could add breadcrumbs or title here if needed */}
            </div>

            {/* Center: Search Bar */}
            <div className="flex w-1/3 justify-center">
                <div className="relative flex w-full max-w-sm items-center">
                    <Search className="absolute left-3 h-4 w-4 text-[oklch(0.6_0.04_135)]" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="h-10 w-full rounded-2xl border border-[oklch(0.93_0.01_130)] bg-[oklch(0.98_0.005_135)] pl-10 pr-4 text-[13px] text-[oklch(0.25_0.03_135)] placeholder:text-[oklch(0.6_0.04_135)] focus:border-[oklch(0.55_0.14_135)] focus:outline-none focus:ring-1 focus:ring-[oklch(0.55_0.14_135)] transition-all"
                    />
                </div>
            </div>

            {/* Right: Notifications & Profile */}
            <div className="flex w-1/3 items-center justify-end gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-xl text-[oklch(0.6_0.04_135)] hover:bg-[oklch(0.97_0.01_135)] hover:text-[oklch(0.3_0.04_135)]"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 flex h-2.5 w-2.5 rounded-full bg-[oklch(0.6_0.18_20)] border-2 border-white" />
                </Button>

                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
                    {mounted ? (
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "h-9 w-9 ring-2 ring-[oklch(0.93_0.01_130)] hover:ring-[oklch(0.55_0.14_135)] transition-all",
                                },
                            }}
                        />
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-[oklch(0.94_0.02_130)] animate-pulse" />
                    )}
                </div>
            </div>
        </header>
    );
}
