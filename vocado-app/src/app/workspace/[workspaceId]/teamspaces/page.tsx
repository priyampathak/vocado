import { getWorkspaceTeamspaces, getUserRole } from "@/app/actions/teamspace";
import { TeamspacesClient } from "./teamspaces-client";

interface TeamspacesPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function TeamspacesPage({ params }: TeamspacesPageProps) {
  const { workspaceId } = await params;
  const teamspaces = await getWorkspaceTeamspaces(workspaceId);
  const userRole = await getUserRole(workspaceId);

  return <TeamspacesClient workspaceId={workspaceId} teamspaces={teamspaces} userRole={userRole} />;
}
