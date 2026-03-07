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
import {
  createTeamspace,
  getWorkspaceMembersExcludingSelf,
  getAdminWorkspaces,
} from "@/app/actions/teamspace";
import { Badge } from "@/components/ui/badge";
import { X, Image, Building2, ChevronRight } from "lucide-react";

interface AdminWorkspace {
  id: string;
  name: string;
  logoUrl: string | null;
  role: string;
}

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
  const [step, setStep] = React.useState<"select-workspace" | "create">("select-workspace");
  const [adminWorkspaces, setAdminWorkspaces] = React.useState<AdminWorkspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string>("");
  const [loadingWorkspaces, setLoadingWorkspaces] = React.useState(false);

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
      setStep("select-workspace");
      setSelectedWorkspaceId("");
      setError(null);
      setLoadingWorkspaces(true);
      getAdminWorkspaces()
        .then((workspaces) => {
          setAdminWorkspaces(workspaces);
          if (workspaces.length === 1) {
            setSelectedWorkspaceId(workspaces[0].id);
          } else {
            const match = workspaces.find((w) => w.id === workspaceId);
            if (match) setSelectedWorkspaceId(match.id);
          }
        })
        .catch((err) => setError(err.message || "Failed to load workspaces"))
        .finally(() => setLoadingWorkspaces(false));
    } else {
      resetForm();
    }
  }, [open, workspaceId]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setIcon("Folder");
    setSelectedMembers([]);
    setWorkspaceMembers([]);
    setError(null);
    setStep("select-workspace");
    setSelectedWorkspaceId("");
  };

  const handleWorkspaceConfirm = async () => {
    if (!selectedWorkspaceId) {
      setError("Please select a workspace");
      return;
    }
    setError(null);
    setStep("create");

    try {
      const members = await getWorkspaceMembersExcludingSelf(selectedWorkspaceId);
      setWorkspaceMembers(members);
    } catch (err) {
      console.error("Failed to load workspace members:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const teamspace = await createTeamspace(selectedWorkspaceId, {
        name: name.trim(),
        description: description.trim() || undefined,
        emoji: icon,
        memberIds: selectedMembers,
      });
      onSuccess(teamspace);
      onOpenChange(false);
      resetForm();
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

  const selectedWorkspace = adminWorkspaces.find((w) => w.id === selectedWorkspaceId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {step === "select-workspace" ? (
            <>
              <DialogHeader>
                <DialogTitle>Select Workspace</DialogTitle>
                <DialogDescription>
                  Choose which workspace to create the teamspace in. Only workspaces where you have Admin or Owner role are shown.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {loadingWorkspaces ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    Loading workspaces...
                  </div>
                ) : adminWorkspaces.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      You don&apos;t have Admin or Owner role in any workspace.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {adminWorkspaces.map((ws) => (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => setSelectedWorkspaceId(ws.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                          selectedWorkspaceId === ws.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-semibold text-sm shrink-0">
                          {ws.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{ws.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {ws.role.toLowerCase()}
                          </p>
                        </div>
                        {selectedWorkspaceId === ws.id && (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    {error}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleWorkspaceConfirm}
                  disabled={!selectedWorkspaceId || adminWorkspaces.length === 0}
                  className="gap-2"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Create New Teamspace</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <span>Creating in</span>
                  <Badge variant="secondary" className="font-medium">
                    {selectedWorkspace?.name}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => { setStep("select-workspace"); setError(null); }}
                    className="text-xs text-primary hover:underline ml-1"
                  >
                    Change
                  </button>
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
                  <Label htmlFor="ts-name">Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="ts-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter teamspace name"
                    required
                    autoFocus
                  />
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <Label htmlFor="ts-description">Description</Label>
                  <Textarea
                    id="ts-description"
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
            </>
          )}
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
