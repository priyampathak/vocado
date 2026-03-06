import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TheStream } from "@/components/layout/stream";
import { Topbar } from "@/components/layout/topbar";

export default async function WorkspaceLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[var(--color-beige)] text-foreground">
            {/* Sidebar Region (Controls safe padding around the left side) */}
            <div className="h-full py-5 pl-5 z-20">
                <Sidebar workspaceId={workspaceId} />
            </div>

            {/* Main Canvas Region */}
            <div className="flex flex-1 flex-col overflow-hidden h-full">
                <Topbar />
                <main className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
                    {children}
                </main>
            </div>

            {/* Stream (context-aware right panel) */}
            <TheStream />
        </div>
    );
}
