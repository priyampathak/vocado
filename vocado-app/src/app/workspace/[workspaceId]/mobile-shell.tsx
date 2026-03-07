"use client";

import React, { useState } from "react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileDock } from "@/components/layout/mobile-dock";
import { MobileSpaces } from "@/components/layout/mobile-spaces";

interface WorkspaceItem {
    id: string;
    name: string;
    role: string;
    inviteCode: string;
}

interface MobileShellProps {
    children: React.ReactNode;
    teamspaceTree: any[];
    mySpaceTree: any[];
    workspaces: WorkspaceItem[];
    currentWorkspaceId: string;
}

export function MobileShell({ children, teamspaceTree, mySpaceTree, workspaces, currentWorkspaceId }: MobileShellProps) {
    const [spacesOpen, setSpacesOpen] = useState(false);

    return (
        <div className="flex md:hidden flex-1 flex-col h-full w-full overflow-hidden">
            <MobileHeader workspaces={workspaces} currentWorkspaceId={currentWorkspaceId} />

            <main className="flex-1 overflow-y-auto px-3 pb-24 pt-1">
                {children}
            </main>

            <MobileDock onSpacesToggle={() => setSpacesOpen((p) => !p)} />

            <MobileSpaces
                open={spacesOpen}
                onClose={() => setSpacesOpen(false)}
                teamspaceTree={teamspaceTree}
                mySpaceTree={mySpaceTree}
            />
        </div>
    );
}
