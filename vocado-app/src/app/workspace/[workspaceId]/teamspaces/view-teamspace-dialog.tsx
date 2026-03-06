"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  getTeamspaceDetails,
  removeTeamspaceMember,
  updateTeamspaceMemberRole,
  addTeamspaceMember,
  getWorkspaceMembers,
} from "@/app/actions/teamspace";
import { TeamRole } from "@prisma/client";
import { Users, Calendar, FolderOpen, FileText, Trash2, UserPlus, Image } from "lucide-react";

interface ViewTeamspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  teamspace: {
    id: string;
    name: string;
    description: string | null;
    emoji: string | null;
    createdAt: Date;
    userRole: TeamRole | null;
  };
  onUpdate: () => void;
}

export function ViewTeamspaceDialog({
  open,
  onOpenChange,
  workspaceId,
  teamspace: initialTeamspace,
  onUpdate,
}: ViewTeamspaceDialogProps) {
  const [teamspace, setTeamspace] = React.useState<any>(null);
  const [workspaceMembers, setWorkspaceMembers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [addingMember, setAddingMember] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string>("");

  const isAdmin = initialTeamspace.userRole === TeamRole.ADMIN;

  React.useEffect(() => {
    if (open) {
      loadTeamspaceDetails();
      if (isAdmin) {
        loadWorkspaceMembers();
      }
    }
  }, [open, initialTeamspace.id]);

  const loadTeamspaceDetails = async () => {
    setIsLoading(true);
    try {
      const details = await getTeamspaceDetails(workspaceId, initialTeamspace.id);
      setTeamspace(details);
    } catch (error) {
      console.error("Failed to load teamspace details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkspaceMembers = async () => {
    try {
      const members = await getWorkspaceMembers(workspaceId);
      setWorkspaceMembers(members);
    } catch (error) {
      console.error("Failed to load workspace members:", error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await removeTeamspaceMember(workspaceId, initialTeamspace.id, userId);
      await loadTeamspaceDetails();
      onUpdate();
    } catch (error: any) {
      alert(error.message || "Failed to remove member");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: TeamRole) => {
    try {
      await updateTeamspaceMemberRole(workspaceId, initialTeamspace.id, userId, newRole);
      await loadTeamspaceDetails();
      onUpdate();
    } catch (error: any) {
      alert(error.message || "Failed to update role");
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    setAddingMember(true);
    try {
      await addTeamspaceMember(workspaceId, initialTeamspace.id, selectedUserId);
      await loadTeamspaceDetails();
      await loadWorkspaceMembers();
      setSelectedUserId("");
      onUpdate();
    } catch (error: any) {
      alert(error.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return <Image className="h-6 w-6" />;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-6 w-6" /> : <Image className="h-6 w-6" />;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter out members already in the teamspace
  const availableMembers = React.useMemo(() => {
    if (!teamspace) return [];
    const teamspaceMemberIds = teamspace.members.map((m: any) => m.userId);
    return workspaceMembers.filter((wm) => !teamspaceMemberIds.includes(wm.userId));
  }, [workspaceMembers, teamspace]);

  if (isLoading || !teamspace) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading teamspace details...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
              {getIcon(teamspace.emoji)}
            </div>
            <span className="text-2xl font-semibold">{teamspace.name}</span>
          </DialogTitle>
          <DialogDescription className="mt-1 ml-[60px]">
            {teamspace.description || "No description provided"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[600px] pr-4">
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Members</span>
                </div>
                <p className="text-2xl font-bold">{teamspace.members.length}</p>
              </div>
              <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <FolderOpen className="h-4 w-4" />
                  <span className="text-sm font-medium">Folders</span>
                </div>
                <p className="text-2xl font-bold">{teamspace._count.folders}</p>
              </div>
              <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Plots</span>
                </div>
                <p className="text-2xl font-bold">{teamspace._count.plots}</p>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created on {formatDate(teamspace.createdAt)}</span>
            </div>

            <Separator />

            {/* Members Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Members</h3>
                {isAdmin && (
                  <Badge variant="default" className="text-xs">
                    Admin View
                  </Badge>
                )}
              </div>

              {/* Add Member (Admin Only) */}
              {isAdmin && availableMembers.length > 0 && (
                <div className="flex gap-2">
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a member to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMembers.map((member) => (
                        <SelectItem key={member.userId} value={member.userId}>
                          {member.user.name} ({member.user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddMember}
                    disabled={!selectedUserId || addingMember}
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {addingMember ? "Adding..." : "Add"}
                  </Button>
                </div>
              )}

              {/* Member List */}
              <div className="space-y-2">
                {teamspace.members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                        {member.user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin ? (
                        <Select
                          value={member.role}
                          onValueChange={(value) =>
                            handleUpdateRole(member.userId, value as TeamRole)
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={TeamRole.ADMIN}>Admin</SelectItem>
                            <SelectItem value={TeamRole.MEMBER}>Member</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant={member.role === TeamRole.ADMIN ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {member.role.toLowerCase()}
                        </Badge>
                      )}
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.userId)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
