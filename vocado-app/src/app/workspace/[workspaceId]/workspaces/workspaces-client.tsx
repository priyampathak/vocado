"use client";

import * as React from "react";
import { Plus, MoreVertical, Eye, Pencil, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { deleteWorkspace } from "@/app/actions/workspace";
import { useRouter } from "next/navigation";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { EditWorkspaceDialog } from "./edit-workspace-dialog";
import { ViewWorkspaceDialog } from "./view-workspace-dialog";
import { Role } from "@prisma/client";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  inviteCode: string;
  createdAt: Date;
  members: Array<{
    id: string;
    role: Role;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    };
  }>;
  _count?: {
    teamspaces: number;
    members: number;
  };
  userRole: Role;
}

interface WorkspacesClientProps {
  currentWorkspaceId: string;
  workspaces: Workspace[];
}

export function WorkspacesClient({
  currentWorkspaceId,
  workspaces: initialWorkspaces,
}: WorkspacesClientProps) {
  const router = useRouter();
  const [workspaces, setWorkspaces] = React.useState(initialWorkspaces);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<Workspace | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const handleDelete = async (workspaceId: string) => {
    if (!confirm("Are you sure you want to delete this workspace? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(workspaceId);
    try {
      await deleteWorkspace(workspaceId);
      setWorkspaces((prev) => prev.filter((ws) => ws.id !== workspaceId));
    } catch (error: any) {
      alert(error.message || "Failed to delete workspace");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setEditDialogOpen(true);
  };

  const handleView = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setViewDialogOpen(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadge = (role: Role) => {
    const colors = {
      OWNER: "bg-purple-100 text-purple-700 border-purple-200",
      ADMIN: "bg-blue-100 text-blue-700 border-blue-200",
      MEMBER: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
      <Badge className={`${colors[role]} border`} variant="outline">
        {role}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 px-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workspaces</h1>
          <p className="text-muted-foreground mt-1">
            Manage your workspaces and their members
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2 bg-primary hover:bg-primary/90 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Workspace
        </Button>
      </div>

      {/* Table */}
      {workspaces.length === 0 ? (
        <div className="border rounded-xl p-12 text-center bg-card">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No workspaces yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first workspace to get started
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </Button>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Members</TableHead>
                <TableHead className="text-center">Teamspaces</TableHead>
                <TableHead>Your Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Invite Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.map((workspace) => (
                <TableRow
                  key={workspace.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={(e) => {
                    // Prevent row click if clicking the action button or avatar area
                    if ((e.target as HTMLElement).closest('.text-right')) return;
                    handleView(workspace);
                  }}
                >
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={workspace.logoUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {workspace.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{workspace.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {workspace.description || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-normal">
                      {workspace._count?.members || workspace.members.length}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-normal">
                      {workspace._count?.teamspaces || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>{getRoleBadge(workspace.userRole)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(workspace.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {workspace.inviteCode}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleView(workspace)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {(workspace.userRole === "OWNER" || workspace.userRole === "ADMIN") && (
                          <>
                            <DropdownMenuItem onClick={() => handleEdit(workspace)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Workspace
                            </DropdownMenuItem>
                            {workspace.userRole === "OWNER" && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(workspace.id)}
                                disabled={isDeleting === workspace.id}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {isDeleting === workspace.id ? "Deleting..." : "Delete Workspace"}
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialogs */}
      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        currentWorkspaceId={currentWorkspaceId}
        onSuccess={(newWorkspace: any) => {
          setWorkspaces((prev) => [newWorkspace, ...prev]);
          setCreateDialogOpen(false);
        }}
      />

      {selectedWorkspace && (
        <>
          <EditWorkspaceDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            workspace={selectedWorkspace}
            onSuccess={(updatedWorkspace: any) => {
              setWorkspaces((prev) =>
                prev.map((ws) => (ws.id === updatedWorkspace.id ? { ...ws, ...updatedWorkspace } : ws))
              );
              setEditDialogOpen(false);
            }}
          />

          <ViewWorkspaceDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            workspace={selectedWorkspace}
            onUpdate={(updatedWorkspace: any) => {
              setWorkspaces((prev) =>
                prev.map((ws) => (ws.id === updatedWorkspace.id ? updatedWorkspace : ws))
              );
            }}
          />
        </>
      )}
    </div>
  );
}
