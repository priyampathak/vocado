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
import { IconPicker } from "@/components/icon-picker";
import { updateTeamspace } from "@/app/actions/teamspace";
import { Image } from "lucide-react";

interface EditTeamspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  teamspace: {
    id: string;
    name: string;
    description: string | null;
    emoji: string | null;
  };
  onSuccess: (teamspace: any) => void;
}

export function EditTeamspaceDialog({
  open,
  onOpenChange,
  workspaceId,
  teamspace,
  onSuccess,
}: EditTeamspaceDialogProps) {
  const [name, setName] = React.useState(teamspace.name);
  const [description, setDescription] = React.useState(teamspace.description || "");
  const [icon, setIcon] = React.useState<string>(teamspace.emoji || "Folder");
  const [iconPickerOpen, setIconPickerOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setName(teamspace.name);
      setDescription(teamspace.description || "");
      setIcon(teamspace.emoji || "Folder");
    }
  }, [open, teamspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updated = await updateTeamspace(workspaceId, teamspace.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        emoji: icon,
      });
      onSuccess(updated);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to update teamspace");
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-5 w-5" /> : <Image className="h-5 w-5" />;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Teamspace</DialogTitle>
            <DialogDescription>
              Update teamspace information
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
                {isLoading ? "Saving..." : "Save Changes"}
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
