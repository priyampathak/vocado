"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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
