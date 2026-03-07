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
import { createWorkspaceFromDialog, searchUsersForWorkspace } from "@/app/actions/workspace";
import { Badge } from "@/components/ui/badge";
import { X, Image, Search } from "lucide-react";
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
  const [selectedUserDetails, setSelectedUserDetails] = React.useState<any[]>([]);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [memberSearch, setMemberSearch] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    if (memberSearch.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const timeout = setTimeout(() => {
      searchUsersForWorkspace(memberSearch)
        .then(setSearchResults)
        .catch(console.error)
        .finally(() => setIsSearching(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [memberSearch, open]);

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
      setName("");
      setDescription("");
      setLogoUrl("");
      setSelectedMembers([]);
      setSelectedUserDetails([]);
      setMemberSearch("");
      setSearchResults([]);
    } catch (err: any) {
      setError(err.message || "Failed to create workspace");
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = (user: any) => {
    if (!selectedMembers.includes(user.id)) {
      setSelectedMembers((prev) => [...prev, user.id]);
      setSelectedUserDetails((prev) => [...prev, user]);
    }
    setMemberSearch("");
    setSearchResults([]);
  };

  const removeMember = (userId: string) => {
    setSelectedMembers((prev) => prev.filter((id) => id !== userId));
    setSelectedUserDetails((prev) => prev.filter((u) => u.id !== userId));
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
              Search by name or email to add members (they will be assigned MEMBER role)
            </p>
            
            {/* Selected Members */}
            {selectedUserDetails.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 p-3 bg-muted/30 rounded-lg">
                {selectedUserDetails.map((user) => (
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
                      onClick={() => removeMember(user.id)}
                      className="ml-1 rounded-full hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email (min 2 chars)..."
                className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </div>

            {/* Search Results */}
            {(memberSearch.trim().length >= 2) && (
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {isSearching ? (
                  <div className="py-3 text-sm text-center text-muted-foreground">Searching...</div>
                ) : searchResults.filter((u) => !selectedMembers.includes(u.id)).length === 0 ? (
                  <div className="py-3 text-sm text-center text-muted-foreground">No users found</div>
                ) : (
                  searchResults
                    .filter((u) => !selectedMembers.includes(u.id))
                    .map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => addMember(user)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors text-left"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">({user.email})</span>
                      </button>
                    ))
                )}
              </div>
            )}
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
