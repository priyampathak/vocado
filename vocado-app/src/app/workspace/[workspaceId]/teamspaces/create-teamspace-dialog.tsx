"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPicker } from "@/components/icon-picker";
import { createTeamspace, getWorkspaceMembersExcludingSelf } from "@/app/actions/teamspace";
import { Badge } from "@/components/ui/badge";
import { X, Image } from "lucide-react";

interface CreateTeamspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onSuccess: (teamspace: any) => void;
}

export function CreateTeamspaceDialog({
  open,
  onOpenChange,
  workspaceId,
  onSuccess,
}: CreateTeamspaceDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [icon, setIcon] = React.useState<string>("Folder");
  const [iconPickerOpen, setIconPickerOpen] = React.useState(false);
  const [selectedMembers, setSelectedMembers] = React.useState<string[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      // Load workspace members (excluding current user since they're auto-added as admin)
      getWorkspaceMembersExcludingSelf(workspaceId)
        .then(setWorkspaceMembers)
        .catch(console.error);
    }
  }, [open, workspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const teamspace = await createTeamspace(workspaceId, {
        name: name.trim(),
        description: description.trim() || undefined,
        emoji: icon,
        memberIds: selectedMembers,
      });
      onSuccess(teamspace);
      onOpenChange(false);
      // Reset form
      setName("");
      setDescription("");
      setIcon("Folder");
      setSelectedMembers([]);
    } catch (err: any) {
      setError(err.message || "Failed to create teamspace");
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-5 w-5" /> : <Image className="h-5 w-5" />;
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Teamspace</DialogTitle>
            <DialogDescription>
              Create a new teamspace to organize your projects and collaborate with your team
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Icon Selector */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIconPickerOpen(true)}
                className="w-full justify-start gap-3 h-12"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                  {getIcon(icon)}
                </div>
                <span className="text-muted-foreground">Click to change icon</span>
              </Button>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter teamspace name"
                required
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter teamspace description (optional)"
                rows={3}
              />
            </div>

            {/* Member Selection */}
            <div className="space-y-2">
              <Label>Add Team Members (optional)</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {workspaceMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No other workspace members to add
                  </p>
                ) : (
                  workspaceMembers.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                      onClick={() => toggleMember(member.userId)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.userId)}
                          onChange={() => toggleMember(member.userId)}
                          className="rounded cursor-pointer"
                        />
                        <div>
                          <p className="text-sm font-medium">{member.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Member
                      </Badge>
                    </div>
                  ))
                )}
              </div>
              <div className="bg-muted/50 border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> You will be automatically added as an Admin. Select additional members to add to this teamspace (they will have Member role by default).
                </p>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Teamspace"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <IconPicker
        open={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        onSelectIcon={setIcon}
        currentIcon={icon}
      />
    </>
  );
}
