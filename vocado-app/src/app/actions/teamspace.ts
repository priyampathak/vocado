"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Role, TeamRole } from "@prisma/client";

// ──────────────────────────────────────────
// Helper: resolve Clerk → MongoDB user
// ──────────────────────────────────────────
async function requireDbUser() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) throw new Error("User not synced. Please wait for webhook or re-login.");

    return dbUser;
}

async function canManageTeamspace(workspaceId: string, teamspaceId: string, userId: string) {
    const workspaceMembership = await db.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
        select: { role: true },
    });

    if (!workspaceMembership) {
        throw new Error("Not a member of this workspace.");
    }

    if (workspaceMembership.role === Role.OWNER || workspaceMembership.role === Role.ADMIN) {
        return true;
    }

    const teamspaceMembership = await db.teamspaceMember.findUnique({
        where: { userId_teamspaceId: { userId, teamspaceId } },
        select: { role: true },
    });

    return teamspaceMembership?.role === TeamRole.ADMIN;
}

// ──────────────────────────────────────────
// Teamspace CRUD
// ──────────────────────────────────────────
export async function createTeamspace(
    workspaceId: string,
    data: {
        name: string;
        description?: string;
        emoji?: string;
        memberIds?: string[]; // User IDs to add as members
    }
) {
    const dbUser = await requireDbUser();

    // Verify workspace membership
    const membership = await db.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    });
    if (!membership) throw new Error("Not a member of this workspace.");

    // Create teamspace with creator as admin
    const teamspace = await db.teamspace.create({
        data: {
            name: data.name,
            description: data.description,
            emoji: data.emoji || "📁",
            workspaceId,
            members: {
                create: [
                    { userId: dbUser.id, role: TeamRole.ADMIN }, // Creator is admin
                    ...(data.memberIds || []).map((userId) => ({
                        userId,
                        role: TeamRole.MEMBER,
                    })),
                ],
            },
        },
        include: {
            members: {
                include: { user: true },
            },
        },
    });

    revalidatePath(`/workspace/${workspaceId}`);
    revalidatePath(`/workspace/${workspaceId}/teamspaces`);
    return teamspace;
}

export async function updateTeamspace(
    workspaceId: string,
    teamspaceId: string,
    data: {
        name?: string;
        description?: string;
        emoji?: string;
    }
) {
    const dbUser = await requireDbUser();

    // Check if user is admin of this teamspace
    const membership = await db.teamspaceMember.findUnique({
        where: { userId_teamspaceId: { userId: dbUser.id, teamspaceId } },
    });
    if (!membership || membership.role !== TeamRole.ADMIN) {
        throw new Error("Only admins can update teamspaces.");
    }

    const teamspace = await db.teamspace.update({
        where: { id: teamspaceId },
        data,
    });

    revalidatePath(`/workspace/${workspaceId}`);
    revalidatePath(`/workspace/${workspaceId}/teamspaces`);
    return teamspace;
}

export async function deleteTeamspace(workspaceId: string, teamspaceId: string) {
    const dbUser = await requireDbUser();

    // Check if user is admin of this teamspace
    const membership = await db.teamspaceMember.findUnique({
        where: { userId_teamspaceId: { userId: dbUser.id, teamspaceId } },
    });
    if (!membership || membership.role !== TeamRole.ADMIN) {
        throw new Error("Only admins can delete teamspaces.");
    }

    await db.teamspace.delete({
        where: { id: teamspaceId },
    });

    revalidatePath(`/workspace/${workspaceId}`);
    revalidatePath(`/workspace/${workspaceId}/teamspaces`);
    return { success: true };
}

export async function addTeamspaceMember(
    workspaceId: string,
    teamspaceId: string,
    userId: string,
    role: TeamRole = TeamRole.MEMBER
) {
    const dbUser = await requireDbUser();

    // Check if user is admin of this teamspace
    const membership = await db.teamspaceMember.findUnique({
        where: { userId_teamspaceId: { userId: dbUser.id, teamspaceId } },
    });
    if (!membership || membership.role !== TeamRole.ADMIN) {
        throw new Error("Only admins can add members.");
    }

    const member = await db.teamspaceMember.create({
        data: { userId, teamspaceId, role },
        include: { user: true },
    });

    revalidatePath(`/workspace/${workspaceId}/teamspaces`);
    return member;
}

export async function removeTeamspaceMember(
    workspaceId: string,
    teamspaceId: string,
    memberIdToRemove: string
) {
    const dbUser = await requireDbUser();

    // Check if user is admin of this teamspace
    const membership = await db.teamspaceMember.findUnique({
        where: { userId_teamspaceId: { userId: dbUser.id, teamspaceId } },
    });
    if (!membership || membership.role !== TeamRole.ADMIN) {
        throw new Error("Only admins can remove members.");
    }

    await db.teamspaceMember.delete({
        where: { userId_teamspaceId: { userId: memberIdToRemove, teamspaceId } },
    });

    revalidatePath(`/workspace/${workspaceId}/teamspaces`);
    return { success: true };
}

export async function updateTeamspaceMemberRole(
    workspaceId: string,
    teamspaceId: string,
    memberIdToUpdate: string,
    newRole: TeamRole
) {
    const dbUser = await requireDbUser();

    // Check if user is admin of this teamspace
    const membership = await db.teamspaceMember.findUnique({
        where: { userId_teamspaceId: { userId: dbUser.id, teamspaceId } },
    });
    if (!membership || membership.role !== TeamRole.ADMIN) {
        throw new Error("Only admins can update member roles.");
    }

    const member = await db.teamspaceMember.update({
        where: { userId_teamspaceId: { userId: memberIdToUpdate, teamspaceId } },
        data: { role: newRole },
        include: { user: true },
    });

    revalidatePath(`/workspace/${workspaceId}/teamspaces`);
    return member;
}

export async function getWorkspaceTeamspaces(workspaceId: string) {
    const dbUser = await requireDbUser();

    // Verify workspace membership
    const workspaceMembership = await db.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    });
    if (!workspaceMembership) throw new Error("Not a member of this workspace.");

    // Get all teamspaces where user is a member
    const teamspaces = await db.teamspace.findMany({
        where: {
            workspaceId,
            members: {
                some: { userId: dbUser.id },
            },
        },
        include: {
            members: {
                include: { user: true },
            },
            _count: {
                select: {
                    folders: true,
                    plots: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // Add user's role to each teamspace
    return teamspaces.map((ts) => ({
        ...ts,
        userRole: ts.members.find((m) => m.userId === dbUser.id)?.role || null,
    }));
}

export async function getTeamspaceDetails(workspaceId: string, teamspaceId: string) {
    const dbUser = await requireDbUser();

    // Check if user is member of this teamspace
    const membership = await db.teamspaceMember.findUnique({
        where: { userId_teamspaceId: { userId: dbUser.id, teamspaceId } },
    });
    if (!membership) {
        throw new Error("You are not a member of this teamspace.");
    }

    const teamspace = await db.teamspace.findUnique({
        where: { id: teamspaceId },
        include: {
            members: {
                include: { user: true },
                orderBy: { createdAt: "asc" },
            },
            _count: {
                select: {
                    folders: true,
                    plots: true,
                },
            },
        },
    });

    if (!teamspace) throw new Error("Teamspace not found.");

    return {
        ...teamspace,
        userRole: membership.role,
    };
}

export async function getWorkspaceMembers(workspaceId: string) {
    const dbUser = await requireDbUser();

    // Verify membership
    const membership = await db.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    });
    if (!membership) throw new Error("Not a member of this workspace.");

    const members = await db.workspaceMember.findMany({
        where: { workspaceId },
        include: { user: true },
        orderBy: { createdAt: "asc" },
    });

    return members;
}

/** Get workspace members excluding the current user (for teamspace creation) */
export async function getWorkspaceMembersExcludingSelf(workspaceId: string) {
    const dbUser = await requireDbUser();

    // Verify membership
    const membership = await db.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    });
    if (!membership) throw new Error("Not a member of this workspace.");

    const members = await db.workspaceMember.findMany({
        where: {
            workspaceId,
            userId: { not: dbUser.id }, // Exclude current user
        },
        include: { user: true },
        orderBy: { createdAt: "asc" },
    });

    return members;
}

// ──────────────────────────────────────────
// Folder CRUD (inside Teamspace, NO nesting)
// ──────────────────────────────────────────
export async function createFolder(workspaceId: string, teamspaceId: string, name: string) {
    const dbUser = await requireDbUser();

    const canManage = await canManageTeamspace(workspaceId, teamspaceId, dbUser.id);
    if (!canManage) throw new Error("Only workspace admins or teamspace admins can create folders.");

    const folder = await db.folder.create({
        data: { name, teamspaceId },
    });

    revalidatePath(`/workspace/${workspaceId}`);
    return folder;
}

export async function deleteFolder(workspaceId: string, folderId: string) {
    const dbUser = await requireDbUser();

    // Get the folder to find its teamspace
    const folder = await db.folder.findUnique({
        where: { id: folderId },
        include: { teamspace: true },
    });
    if (!folder) throw new Error("Folder not found.");

    const canManage = await canManageTeamspace(workspaceId, folder.teamspaceId, dbUser.id);
    if (!canManage) throw new Error("Only workspace admins or teamspace admins can delete folders.");

    // Delete the folder (cascade will delete plots inside)
    await db.folder.delete({
        where: { id: folderId },
    });

    revalidatePath(`/workspace/${workspaceId}`);
    return { success: true };
}

export async function renameFolder(workspaceId: string, folderId: string, name: string) {
    const dbUser = await requireDbUser();

    const folder = await db.folder.findUnique({
        where: { id: folderId },
        select: { teamspaceId: true },
    });
    if (!folder) throw new Error("Folder not found.");

    const canManage = await canManageTeamspace(workspaceId, folder.teamspaceId, dbUser.id);
    if (!canManage) throw new Error("Only workspace admins or teamspace admins can rename folders.");

    const updated = await db.folder.update({
        where: { id: folderId },
        data: { name },
    });

    revalidatePath(`/workspace/${workspaceId}`);
    return updated;
}

export async function deletePlot(workspaceId: string, plotId: string) {
    const dbUser = await requireDbUser();

    const plot = await db.plot.findUnique({
        where: { id: plotId },
        select: { teamspaceId: true },
    });
    if (!plot) throw new Error("Plot not found.");

    const canManage = await canManageTeamspace(workspaceId, plot.teamspaceId, dbUser.id);
    if (!canManage) throw new Error("Only workspace admins or teamspace admins can delete plots.");

    await db.plot.delete({
        where: { id: plotId },
    });

    revalidatePath(`/workspace/${workspaceId}`);
    return { success: true };
}

export async function renamePlot(workspaceId: string, plotId: string, name: string) {
    const dbUser = await requireDbUser();

    const plot = await db.plot.findUnique({
        where: { id: plotId },
        select: { teamspaceId: true },
    });
    if (!plot) throw new Error("Plot not found.");

    const canManage = await canManageTeamspace(workspaceId, plot.teamspaceId, dbUser.id);
    if (!canManage) throw new Error("Only workspace admins or teamspace admins can rename plots.");

    const updated = await db.plot.update({
        where: { id: plotId },
        data: { name },
    });

    revalidatePath(`/workspace/${workspaceId}`);
    return updated;
}

// ──────────────────────────────────────────
// Plot CRUD
// ──────────────────────────────────────────
export async function createPlot(
    workspaceId: string,
    teamspaceId: string,
    name: string,
    options?: { folderId?: string; isPrivate?: boolean; color?: string }
) {
    const dbUser = await requireDbUser();

    const canManage = await canManageTeamspace(workspaceId, teamspaceId, dbUser.id);
    if (!canManage) throw new Error("Only workspace admins or teamspace admins can create plots.");

    const plot = await db.plot.create({
        data: {
            name,
            teamspaceId,
            creatorId: dbUser.id,
            folderId: options?.folderId ?? null,
            isPrivate: options?.isPrivate ?? false,
            color: options?.color ?? "#3b82f6",
        },
    });

    revalidatePath(`/workspace/${workspaceId}`);
    return plot;
}

// ──────────────────────────────────────────
// Data Fetchers (for Sidebar)
// ──────────────────────────────────────────

/** All teamspace trees for sidebar: Teamspaces → Folders → Plots (non-private) */
export async function getTeamspaceTree(workspaceId: string) {
    const dbUser = await requireDbUser();

    // Verify membership
    const membership = await db.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    });
    if (!membership) return [];

    // Only fetch teamspaces where the user is a member
    const teamspaces = await db.teamspace.findMany({
        where: {
            workspaceId,
            members: {
                some: { userId: dbUser.id },
            },
        },
        include: {
            members: {
                where: { userId: dbUser.id },
                select: { role: true },
            },
            folders: {
                include: {
                    plots: { where: { isPrivate: false }, orderBy: { createdAt: "asc" } },
                },
                orderBy: { createdAt: "asc" },
            },
            plots: {
                where: { isPrivate: false, folderId: null },
                orderBy: { createdAt: "asc" },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    return teamspaces;
}

/** My Space: private plots created by the current user, grouped by teamspace */
export async function getMySpaceTree(workspaceId: string) {
    const dbUser = await requireDbUser();

    // Only fetch teamspaces where the user is a member
    const teamspaces = await db.teamspace.findMany({
        where: {
            workspaceId,
            members: {
                some: { userId: dbUser.id },
            },
        },
        include: {
            members: {
                where: { userId: dbUser.id },
                select: { role: true },
            },
            folders: {
                include: {
                    plots: {
                        where: { isPrivate: true, creatorId: dbUser.id },
                        orderBy: { createdAt: "asc" },
                    },
                },
                orderBy: { createdAt: "asc" },
            },
            plots: {
                where: { isPrivate: true, creatorId: dbUser.id, folderId: null },
                orderBy: { createdAt: "asc" },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    // Only return teamspaces that have at least one private plot
    return teamspaces.filter(
        (ts) =>
            ts.plots.length > 0 ||
            ts.folders.some((f) => f.plots.length > 0)
    );
}

/** Get user's workspaces for the workspace switcher */
export async function getUserWorkspaces() {
    const dbUser = await requireDbUser();

    const memberships = await db.workspaceMember.findMany({
        where: { userId: dbUser.id },
        include: { workspace: true },
        orderBy: { createdAt: "asc" },
    });

    return memberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        role: m.role,
        inviteCode: m.workspace.inviteCode,
    }));
}

/** Get user's role in a workspace */
export async function getUserRole(workspaceId: string) {
    const dbUser = await requireDbUser();

    const membership = await db.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    });

    return membership?.role ?? null;
}
