import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TheStream } from "@/components/layout/stream";
import { Topbar } from "@/components/layout/topbar";
import { getTeamspaceTree, getMySpaceTree, getUserWorkspaces } from "@/app/actions/teamspace";
import { MobileShell } from "./mobile-shell";

export default async function WorkspaceLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;

    const [teamspaceTree, mySpaceTree, workspaces] = await Promise.all([
        getTeamspaceTree(workspaceId),
        getMySpaceTree(workspaceId),
        getUserWorkspaces(),
    ]);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-(--color-beige) text-foreground">
            {/* Desktop: Sidebar */}
            <div className="hidden md:flex h-full py-5 pl-5 z-20">
                <Sidebar workspaceId={workspaceId} />
            </div>

            {/* Desktop: Main Canvas */}
            <div className="hidden md:flex flex-1 flex-col overflow-hidden h-full">
                <Topbar />
                <main className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
                    {children}
                </main>
            </div>

            {/* Desktop: Stream */}
            <div className="hidden md:block">
                <TheStream />
            </div>

            {/* Mobile: Full-screen mobile shell */}
            <MobileShell
                teamspaceTree={JSON.parse(JSON.stringify(teamspaceTree))}
                mySpaceTree={JSON.parse(JSON.stringify(mySpaceTree))}
                workspaces={JSON.parse(JSON.stringify(workspaces))}
                currentWorkspaceId={workspaceId}
            >
                {children}
            </MobileShell>
        </div>
    );
}
