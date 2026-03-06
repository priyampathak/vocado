import { getAllUserWorkspaces } from "@/app/actions/workspace";
import { WorkspacesClient } from "./workspaces-client";

interface WorkspacesPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspacesPage({ params }: WorkspacesPageProps) {
  const { workspaceId } = await params;
  const workspaces = await getAllUserWorkspaces();

  return <WorkspacesClient currentWorkspaceId={workspaceId} workspaces={workspaces} />;
}
