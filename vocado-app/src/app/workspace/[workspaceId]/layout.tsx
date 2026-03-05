import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TheStream } from "@/components/layout/stream";

export default async function WorkspaceLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;

    return (
        <div className="flex h-screen overflow-hidden bg-[oklch(0.97_0.008_135)] text-foreground">
            {/* Sidebar: 20% width */}
            <Sidebar workspaceId={workspaceId} />

            {/* Main Canvas: 80% width */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4">
                    {children}
                </main>
            </div>

            {/* Stream (context-aware right panel) */}
            <TheStream />
        </div>
    );
}
