"use client";

import React from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import {
    LayoutDashboard,
    MessageCircle,
    Mail,
    Bell,
    Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DockItem {
    icon: React.ElementType;
    label: string;
    href: string;
    matchPrefix?: boolean;
}

export function MobileDock({ onSpacesToggle }: { onSpacesToggle: () => void }) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    const items: DockItem[] = [
        { icon: LayoutDashboard, label: "Home", href: `/workspace/${workspaceId}` },
        { icon: MessageCircle, label: "Chat", href: `/workspace/${workspaceId}/chat`, matchPrefix: true },
        { icon: Mail, label: "Mail", href: `/workspace/${workspaceId}/mailbox`, matchPrefix: true },
        { icon: Bell, label: "Alerts", href: `/workspace/${workspaceId}/notifications`, matchPrefix: true },
        { icon: Layers, label: "Spaces", href: "__spaces__" },
    ];

    const isActive = (item: DockItem) => {
        if (item.href === "__spaces__") return false;
        if (item.matchPrefix) return pathname.startsWith(item.href);
        return pathname === item.href;
    };

    const handleTap = (item: DockItem) => {
        if (item.href === "__spaces__") {
            onSpacesToggle();
            return;
        }
        router.push(item.href);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="mx-3 mb-3">
                <nav
                    className="flex items-center justify-around rounded-[22px] px-2 py-2"
                    style={{
                        background: "rgba(255, 255, 255, 0.72)",
                        backdropFilter: "blur(24px) saturate(180%)",
                        WebkitBackdropFilter: "blur(24px) saturate(180%)",
                        boxShadow:
                            "0 -2px 40px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.45)",
                    }}
                >
                    {items.map((item) => {
                        const active = isActive(item);
                        return (
                            <button
                                key={item.label}
                                onClick={() => handleTap(item)}
                                className={cn(
                                    "relative flex flex-col items-center justify-center gap-0.5 rounded-2xl px-4 py-2 transition-all duration-300 active:scale-90",
                                    active && "scale-[1.02]"
                                )}
                            >
                                {active && (
                                    <div
                                        className="absolute inset-0 rounded-2xl"
                                        style={{
                                            background: "rgba(255, 255, 255, 0.55)",
                                            backdropFilter: "blur(8px)",
                                            WebkitBackdropFilter: "blur(8px)",
                                            boxShadow:
                                                "0 2px 16px rgba(30, 38, 49, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
                                            border: "1px solid rgba(255, 255, 255, 0.5)",
                                        }}
                                    />
                                )}
                                <item.icon
                                    className={cn(
                                        "relative z-10 h-[22px] w-[22px] transition-colors duration-200",
                                        active
                                            ? "text-slate"
                                            : "text-slate/40"
                                    )}
                                    strokeWidth={active ? 2.2 : 1.8}
                                />
                                <span
                                    className={cn(
                                        "relative z-10 text-[10px] font-semibold tracking-wide transition-colors duration-200",
                                        active
                                            ? "text-slate"
                                            : "text-slate/40"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
