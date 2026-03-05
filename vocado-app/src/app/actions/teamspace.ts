"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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

// ──────────────────────────────────────────
// Teamspace CRUD
// ──────────────────────────────────────────
export async function createTeamspace(workspaceId: string, name: string) {
    const dbUser = await requireDbUser();

    // Verify membership
    const membership = await db.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    });
    if (!membership) throw new Error("Not a member of this workspace.");

    const teamspace = await db.teamspace.create({
        data: { name, workspaceId },
    });

    revalidatePath(`/workspace/${workspaceId}`);
    return teamspace;
}

// ──────────────────────────────────────────
// Folder CRUD (inside Teamspace, NO nesting)
// ──────────────────────────────────────────
export async function createFolder(workspaceId: string, teamspaceId: string, name: string) {
    const dbUser = await requireDbUser();

    const membership = await db.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    });
    if (!membership) throw new Error("Not a member of this workspace.");

    const folder = await db.folder.create({
        data: { name, teamspaceId },
    });

    revalidatePath(`/workspace/${workspaceId}`);
    return folder;
}

// ──────────────────────────────────────────
// Plot CRUD
// ──────────────────────────────────────────
export async function createPlot(
    workspaceId: string,
    teamspaceId: string,
    name: string,
    options?: { folderId?: string; isPrivate?: boolean }
) {
    const dbUser = await requireDbUser();

    const membership = await db.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    });
    if (!membership) throw new Error("Not a member of this workspace.");

    const plot = await db.plot.create({
        data: {
            name,
            teamspaceId,
            creatorId: dbUser.id,
            folderId: options?.folderId ?? null,
            isPrivate: options?.isPrivate ?? false,
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

    const teamspaces = await db.teamspace.findMany({
        where: { workspaceId },
        include: {
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

    const teamspaces = await db.teamspace.findMany({
        where: { workspaceId },
        include: {
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
