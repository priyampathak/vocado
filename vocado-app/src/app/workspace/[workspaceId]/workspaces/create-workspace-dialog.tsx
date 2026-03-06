"use client";

import * as React from "react";
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
import { createWorkspaceFromDialog, getAllUsers } from "@/app/actions/workspace";
import { Badge } from "@/components/ui/badge";
import { X, Image } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWorkspaceId: string;
  onSuccess: (workspace: any) => void;
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  currentWorkspaceId,
  onSuccess,
}: CreateWorkspaceDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [selectedMembers, setSelectedMembers] = React.useState<string[]>([]);
  const [allUsers, setAllUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      getAllUsers()
        .then(setAllUsers)
        .catch(console.error);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const workspace = await createWorkspaceFromDialog({
        name: name.trim(),
        description: description.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        memberIds: selectedMembers,
      });
      onSuccess(workspace);
      // Reset form
      setName("");
      setDescription("");
      setLogoUrl("");
      setSelectedMembers([]);
    } catch (err: any) {
      setError(err.message || "Failed to create workspace");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const getSelectedUsers = () => {
    return allUsers.filter((user) => selectedMembers.includes(user.id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace. You will be assigned as the owner automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Workspace Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Acme Inc"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this workspace for?"
              rows={3}
            />
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <div className="flex gap-2">
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                type="url"
              />
              {logoUrl && (
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={logoUrl} />
                  <AvatarFallback>
                    <Image className="h-5 w-5 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-2">
            <Label>Add Team Members</Label>
            <p className="text-sm text-muted-foreground">
              Select members to add to this workspace (they will be assigned as MEMBER role)
            </p>
            
            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 p-3 bg-muted/30 rounded-lg">
                {getSelectedUsers().map((user) => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="pl-0 pr-1 py-1 gap-1"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{user.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleMember(user.id)}
                      className="ml-1 rounded-full hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* User Selection */}
            <Select
              value=""
              onValueChange={(userId) => {
                if (userId && !selectedMembers.includes(userId)) {
                  setSelectedMembers((prev) => [...prev, userId]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select members to add..." />
              </SelectTrigger>
              <SelectContent>
                {allUsers
                  .filter((user) => !selectedMembers.includes(user.id))
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                        <span className="text-xs text-muted-foreground">({user.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                {allUsers.filter((user) => !selectedMembers.includes(user.id)).length === 0 && (
                  <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                    {allUsers.length === 0 ? "No other users available" : "All users added"}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Footer */}
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
              {isLoading ? "Creating..." : "Create Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
