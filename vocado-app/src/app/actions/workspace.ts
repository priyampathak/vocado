"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

function generateInviteCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${segment()}-${segment()}-${segment()}`; // XXXX-XXXX-XXXX
}

async function getOrSyncUser(userId: string) {
    let dbUser = await db.user.findUnique({ where: { clerkId: userId } });

    // If webhook hasn't fired yet or local dev is disconnected from ngrok, sync inline manually:
    if (!dbUser) {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;

        if (!email) return null;

        dbUser = await db.user.create({
            data: {
                clerkId: userId,
                email: email,
                name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
                avatarUrl: clerkUser.imageUrl,
            }
        });
    }

    return dbUser;
}

const createWorkspaceSchema = z.object({
    name: z.string().min(2, "Workspace name must be at least 2 characters."),
});

const joinWorkspaceSchema = z.object({
    inviteCode: z.string().regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, "Must be format XXXX-XXXX-XXXX"),
});

export async function createWorkspace(formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const parsed = createWorkspaceSchema.safeParse({ name });

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    // Next.js actions are stateless, fetch internal MongoDB User
    const dbUser = await getOrSyncUser(userId);
    if (!dbUser) return { error: "Failed to sync user payload from Clerk." };

    const inviteCode = generateInviteCode();

    // ATOMIC DATABASE TRANSACTION via nested create
    const newWorkspace = await db.workspace.create({
        data: {
            name: parsed.data.name,
            inviteCode,
            members: {
                create: {
                    userId: dbUser.id,
                    role: "OWNER",
                },
            },
        },
    });

    // Edge Security Sync - Store the Onboarded status as a JWT Claim
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
        publicMetadata: {
            onboarded: true,
            defaultWorkspaceId: newWorkspace.id,
        },
    });

    // Set bridge cookie so middleware lets us through before JWT refreshes
    const cookieStore = await cookies();
    cookieStore.set("vocado_onboarded", "true", {
        path: "/",
        maxAge: 60, // 60 seconds is plenty for the JWT to refresh
        httpOnly: true,
        sameSite: "lax",
    });

    // Route them immediately into the architecture
    redirect(`/workspace/${newWorkspace.id}`);
}

export async function joinWorkspace(formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const inviteCode = formData.get("inviteCode") as string;
    const parsed = joinWorkspaceSchema.safeParse({ inviteCode: inviteCode.toUpperCase() });

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const workspace = await db.workspace.findUnique({
        where: { inviteCode: parsed.data.inviteCode },
    });

    if (!workspace) return { error: "Invalid invite code" };

    const dbUser = await getOrSyncUser(userId);
    if (!dbUser) return { error: "Failed to sync user payload from Clerk." };

    // Check RBAC duplication
    const existingMember = await db.workspaceMember.findUnique({
        where: {
            userId_workspaceId: {
                userId: dbUser.id,
                workspaceId: workspace.id,
            },
        },
    });

    if (!existingMember) {
        await db.workspaceMember.create({
            data: {
                userId: dbUser.id,
                workspaceId: workspace.id,
                role: "MEMBER",
            },
        });
    }

    // Update edge token cache
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
        publicMetadata: {
            onboarded: true,
            defaultWorkspaceId: workspace.id,
        },
    });

    // Set bridge cookie so middleware lets us through before JWT refreshes
    const cookieStore = await cookies();
    cookieStore.set("vocado_onboarded", "true", {
        path: "/",
        maxAge: 60,
        httpOnly: true,
        sameSite: "lax",
    });

    redirect(`/workspace/${workspace.id}`);
}

// ──────────────────────────────────────────
// Workspace Management CRUD
// ──────────────────────────────────────────

async function requireDbUser() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) throw new Error("User not synced.");
    return dbUser;
}

async function canManageWorkspace(workspaceId: string, userId: string) {
    const membership = await db.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
        select: { role: true },
    });
    return membership?.role === "OWNER" || membership?.role === "ADMIN";
}

export async function getAllUserWorkspaces() {
    const dbUser = await requireDbUser();

    const memberships = await db.workspaceMember.findMany({
        where: { userId: dbUser.id },
        include: {
            workspace: {
                include: {
                    members: {
                        include: { user: true },
                    },
                    _count: {
                        select: {
                            teamspaces: true,
                            members: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return memberships.map((m) => ({
        ...m.workspace,
        userRole: m.role,
    }));
}

export async function createWorkspaceFromDialog(data: {
    name: string;
    description?: string;
    logoUrl?: string;
    memberIds?: string[];
}) {
    const dbUser = await requireDbUser();

    const inviteCode = generateInviteCode();

    const workspace = await db.workspace.create({
        data: {
            name: data.name,
            description: data.description,
            logoUrl: data.logoUrl,
            inviteCode,
            members: {
                create: [
                    { userId: dbUser.id, role: "OWNER" as Role },
                    ...(data.memberIds || []).map((userId) => ({
                        userId,
                        role: "MEMBER" as Role,
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

    return workspace;
}

export async function updateWorkspace(
    workspaceId: string,
    data: {
        name?: string;
        description?: string;
        logoUrl?: string;
    }
) {
    const dbUser = await requireDbUser();

    const canManage = await canManageWorkspace(workspaceId, dbUser.id);
    if (!canManage) throw new Error("Only workspace admins can update workspaces.");

    const workspace = await db.workspace.update({
        where: { id: workspaceId },
        data,
    });

    return workspace;
}

export async function deleteWorkspace(workspaceId: string) {
    const dbUser = await requireDbUser();

    const membership = await db.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    });
    if (membership?.role !== "OWNER") {
        throw new Error("Only workspace owners can delete workspaces.");
    }

    await db.workspace.delete({
        where: { id: workspaceId },
    });

    return { success: true };
}

export async function addWorkspaceMember(
    workspaceId: string,
    userId: string,
    role: "OWNER" | "ADMIN" | "MEMBER" = "MEMBER"
) {
    const dbUser = await requireDbUser();

    const canManage = await canManageWorkspace(workspaceId, dbUser.id);
    if (!canManage) throw new Error("Only workspace admins can add members.");

    const member = await db.workspaceMember.create({
        data: { userId, workspaceId, role },
        include: { user: true },
    });

    return member;
}

export async function removeWorkspaceMember(
    workspaceId: string,
    memberIdToRemove: string
) {
    const dbUser = await requireDbUser();

    const canManage = await canManageWorkspace(workspaceId, dbUser.id);
    if (!canManage) throw new Error("Only workspace admins can remove members.");

    await db.workspaceMember.delete({
        where: { userId_workspaceId: { userId: memberIdToRemove, workspaceId } },
    });

    return { success: true };
}

export async function updateWorkspaceMemberRole(
    workspaceId: string,
    memberIdToUpdate: string,
    newRole: "OWNER" | "ADMIN" | "MEMBER"
) {
    const dbUser = await requireDbUser();

    const canManage = await canManageWorkspace(workspaceId, dbUser.id);
    if (!canManage) throw new Error("Only workspace admins can update member roles.");

    const member = await db.workspaceMember.update({
        where: { userId_workspaceId: { userId: memberIdToUpdate, workspaceId } },
        data: { role: newRole },
        include: { user: true },
    });

    return member;
}

export async function getWorkspaceDetails(workspaceId: string) {
    const dbUser = await requireDbUser();

    const membership = await db.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    });
    if (!membership) {
        throw new Error("You are not a member of this workspace.");
    }

    const workspace = await db.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            members: {
                include: { user: true },
                orderBy: { createdAt: "asc" },
            },
            _count: {
                select: {
                    teamspaces: true,
                    members: true,
                },
            },
        },
    });

    if (!workspace) throw new Error("Workspace not found.");

    return {
        ...workspace,
        userRole: membership.role,
    };
}

export async function getAllUsers() {
    const dbUser = await requireDbUser();

    // Get all users for adding to workspace
    const users = await db.user.findMany({
        where: {
            id: { not: dbUser.id }, // Exclude current user
        },
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
        },
        orderBy: { name: "asc" },
    });

    return users;
}

export async function searchUsers(query: string) {
    const dbUser = await requireDbUser();

    if (!query || query.trim().length === 0) {
        return [];
    }

    const users = await db.user.findMany({
        where: {
            id: { not: dbUser.id }, // Exclude current user
            OR: [
                { email: { contains: query, mode: "insensitive" } },
                { name: { contains: query, mode: "insensitive" } },
            ],
        },
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
        },
        take: 10,
        orderBy: { name: "asc" },
    });

    return users;
}
