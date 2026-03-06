"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Plus, MoreVertical, Eye, Pencil, Trash2, Users } from "lucide-react";
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
import { deleteTeamspace } from "@/app/actions/teamspace";
import { useRouter } from "next/navigation";
import { CreateTeamspaceDialog } from "./create-teamspace-dialog";
import { EditTeamspaceDialog } from "./edit-teamspace-dialog";
import { ViewTeamspaceDialog } from "./view-teamspace-dialog";
import { TeamRole, Role } from "@prisma/client";

interface Teamspace {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  createdAt: Date;
  members: Array<{
    id: string;
    role: TeamRole;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    };
  }>;
  _count?: {
    folders: number;
    plots: number;
  };
  userRole: TeamRole | null;
}

interface TeamspacesClientProps {
  workspaceId: string;
  teamspaces: Teamspace[];
  userRole: Role | null;
}

export function TeamspacesClient({
  workspaceId,
  teamspaces: initialTeamspaces,
  userRole: workspaceUserRole,
}: TeamspacesClientProps) {
  const router = useRouter();
  const [teamspaces, setTeamspaces] = React.useState(initialTeamspaces);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedTeamspace, setSelectedTeamspace] = React.useState<Teamspace | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const handleDelete = async (teamspaceId: string) => {
    if (!confirm("Are you sure you want to delete this teamspace? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(teamspaceId);
    try {
      await deleteTeamspace(workspaceId, teamspaceId);
      setTeamspaces((prev) => prev.filter((ts) => ts.id !== teamspaceId));
    } catch (error: any) {
      alert(error.message || "Failed to delete teamspace");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (teamspace: Teamspace) => {
    setSelectedTeamspace(teamspace);
    setEditDialogOpen(true);
  };

  const handleView = (teamspace: Teamspace) => {
    setSelectedTeamspace(teamspace);
    setViewDialogOpen(true);
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-5 w-5" /> : null;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isWorkspaceAdmin = workspaceUserRole === Role.OWNER || workspaceUserRole === Role.ADMIN;

  return (
    <div className="container mx-auto py-8 px-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teamspaces</h1>
          <p className="text-muted-foreground mt-1">
            Manage your teamspaces and collaborate with your team
          </p>
        </div>
        {isWorkspaceAdmin && (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create Teamspace
          </Button>
        )}
      </div>

      {/* Table */}
      {teamspaces.length === 0 ? (
        <div className="border rounded-xl p-12 text-center bg-card">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No teamspaces yet</h3>
          <p className="text-muted-foreground mb-4">
            {isWorkspaceAdmin
              ? "Create your first teamspace to start collaborating with your team"
              : "No teamspaces have been created yet or you haven't been added to any."}
          </p>
          {isWorkspaceAdmin && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Teamspace
            </Button>
          )}
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
                <TableHead className="text-center">Items</TableHead>
                <TableHead>Your Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamspaces.map((teamspace) => {
                const isTeamspaceAdmin = teamspace.userRole === TeamRole.ADMIN;
                const isAdmin = isWorkspaceAdmin || isTeamspaceAdmin;
                const Icon = teamspace.emoji ? getIcon(teamspace.emoji) : null;

                return (
                  <TableRow
                    key={teamspace.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('.text-right')) return;
                      handleView(teamspace);
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                        {Icon || <Users className="h-5 w-5" />}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{teamspace.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {teamspace.description || "No description"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono">
                        {teamspace.members.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {(teamspace._count?.folders || 0) + (teamspace._count?.plots || 0)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isAdmin ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {teamspace.userRole ? teamspace.userRole.toLowerCase() : "Viewer"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(teamspace.createdAt)}
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
                          <DropdownMenuItem onClick={() => handleView(teamspace)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {isAdmin && (
                            <>
                              <DropdownMenuItem onClick={() => handleEdit(teamspace)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(teamspace.id)}
                                disabled={isDeleting === teamspace.id}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {isDeleting === teamspace.id ? "Deleting..." : "Delete"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialogs */}
      <CreateTeamspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        workspaceId={workspaceId}
        onSuccess={(newTeamspace) => {
          setTeamspaces((prev) => [newTeamspace, ...prev]);
          router.refresh();
        }}
      />

      {selectedTeamspace && (
        <>
          <EditTeamspaceDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            teamspace={selectedTeamspace}
            workspaceId={workspaceId}
            onSuccess={(updated) => {
              setTeamspaces((prev) =>
                prev.map((ts) => (ts.id === updated.id ? { ...ts, ...updated } : ts))
              );
              router.refresh();
            }}
          />
          <ViewTeamspaceDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            teamspace={selectedTeamspace}
            workspaceId={workspaceId}
            onUpdate={() => router.refresh()}
          />
        </>
      )}
    </div>
  );
}
