import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { TheStream } from "@/components/layout/stream";

export default function WorkspaceLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ workspaceId: string }>;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-[oklch(0.99_0.005_130)] text-foreground">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden bg-transparent">
                <Topbar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
            <TheStream />
        </div>
    );
}
