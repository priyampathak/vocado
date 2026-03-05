import { getUserWorkspaces, getUserRole, getTeamspaceTree, getMySpaceTree } from "@/app/actions/teamspace";
import { SidebarClient } from "./sidebar-client";

interface SidebarProps {
  workspaceId: string;
}

export async function Sidebar({ workspaceId }: SidebarProps) {
  // Fetch all sidebar data on the server in parallel
  const [workspaces, userRole, teamspaceTree, mySpaceTree] = await Promise.all([
    getUserWorkspaces(),
    getUserRole(workspaceId),
    getTeamspaceTree(workspaceId),
    getMySpaceTree(workspaceId),
  ]);

  return (
    <SidebarClient
      workspaces={workspaces}
      workspaceId={workspaceId}
      userRole={userRole}
      teamspaceTree={teamspaceTree}
      mySpaceTree={mySpaceTree}
    />
  );
}
