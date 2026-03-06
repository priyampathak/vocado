"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getWorkspaceDetails,
  addWorkspaceMember,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
  searchUsers,
} from "@/app/actions/workspace";
import { Users, Trash2, Building2, UserPlus, Search } from "lucide-react";
import { Role } from "@prisma/client";

interface ViewWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    inviteCode: string;
  };
  onUpdate: (workspace: any) => void;
}

export function ViewWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
  onUpdate,
}: ViewWorkspaceDialogProps) {
  const [details, setDetails] = React.useState<any>(null);
  const [allUsers, setAllUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [addMemberOpen, setAddMemberOpen] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      loadDetails();
      loadAllUsers("");
    }
  }, [open, workspace.id]);

  React.useEffect(() => {
    if (!open) return;

    setIsSearching(true);
    const delayDebounceFn = setTimeout(() => {
      loadAllUsers(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, open]);

  const loadDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getWorkspaceDetails(workspace.id);
      setDetails(data);
      onUpdate(data);
    } catch (err: any) {
      setError(err.message || "Failed to load workspace details");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllUsers = async (query: string) => {
    try {
      const users = await searchUsers(query);
      setAllUsers(users);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      await addWorkspaceMember(workspace.id, userId, "MEMBER");
      await loadDetails();
      setAddMemberOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await removeWorkspaceMember(workspace.id, userId);
      await loadDetails();
    } catch (err: any) {
      alert(err.message || "Failed to remove member");
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await updateWorkspaceMemberRole(workspace.id, userId, newRole);
      await loadDetails();
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    }
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

  const availableUsers = allUsers.filter(
    (user) => !details?.members?.some((m: any) => m.userId === user.id)
  );

  const canManage = details?.userRole === "OWNER" || details?.userRole === "ADMIN";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={workspace.logoUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {workspace.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{workspace.name}</DialogTitle>
              <DialogDescription>
                {workspace.description || "No description"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <div className="text-2xl font-bold">{details._count?.members || 0}</div>
                <div className="text-sm text-muted-foreground">Members</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <div className="text-2xl font-bold">{details._count?.teamspaces || 0}</div>
                <div className="text-sm text-muted-foreground">Teamspaces</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <div className="text-sm font-mono text-muted-foreground">
                  {details.inviteCode}
                </div>
                <div className="text-sm text-muted-foreground">Invite Code</div>
              </div>
            </div>

            {/* Members Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members ({details.members?.length || 0})
                </h3>
                {canManage && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAddMemberOpen(!addMemberOpen)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                )}
              </div>

              {/* Add Member Section */}
              {addMemberOpen && canManage && (
                <div className="mb-4 p-4 border rounded-lg bg-muted/30">
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Search user by email or name</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Type to search..."
                        className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select onValueChange={handleAddMember}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {isSearching ? (
                        <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                          Searching...
                        </div>
                      ) : availableUsers.length === 0 ? (
                        <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                          No users available to add
                        </div>
                      ) : (
                        availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={user.avatarUrl || undefined} />
                                <AvatarFallback className="text-[10px]">
                                  {user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({user.email})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-2">
                {details.members?.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user.avatarUrl || undefined} />
                        <AvatarFallback className="text-sm">
                          {member.user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{member.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.user.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canManage && member.role !== "OWNER" ? (
                        <Select
                          value={member.role}
                          onValueChange={(value: Role) =>
                            handleRoleChange(member.userId, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                            <SelectItem value="MEMBER">MEMBER</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getRoleBadge(member.role)
                      )}

                      {canManage && member.role !== "OWNER" && (
                        <Button
                          size="sm"
                          variant="ghost"
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
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
