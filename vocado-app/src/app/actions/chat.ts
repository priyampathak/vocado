"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ConversationType, ChannelVisibility } from "@prisma/client";

const GROUP_DM_MAX = 8;

// ──────────────────────────────────────────
// Auth helper
// ──────────────────────────────────────────

async function requireDbUser() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const dbUser = await db.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) throw new Error("User not synced.");
    return dbUser;
}

async function requireWorkspaceMember(workspaceId: string, userId: string) {
    const membership = await db.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!membership) throw new Error("Not a workspace member.");
    return membership;
}

async function requireConversationMember(conversationId: string, userId: string) {
    const membership = await db.conversationMember.findUnique({
        where: { conversationId_userId: { conversationId, userId } },
    });
    if (!membership) throw new Error("Not a member of this conversation.");
    return membership;
}

// ──────────────────────────────────────────
// Workspace Members (for @mentions + DM search)
// ──────────────────────────────────────────

export async function getWorkspaceMembersForChat(workspaceId: string) {
    const dbUser = await requireDbUser();
    await requireWorkspaceMember(workspaceId, dbUser.id);

    const members = await db.workspaceMember.findMany({
        where: { workspaceId },
        include: {
            user: {
                select: { id: true, name: true, email: true, avatarUrl: true, clerkId: true },
            },
        },
        orderBy: { user: { name: "asc" } },
    });

    return members.map((m) => ({
        userId: m.user.id,
        clerkId: m.user.clerkId,
        name: m.user.name,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
        role: m.role,
        isSelf: m.user.id === dbUser.id,
    }));
}

// ──────────────────────────────────────────
// Conversations: List
// ──────────────────────────────────────────

export async function getConversations(workspaceId: string) {
    const dbUser = await requireDbUser();
    await requireWorkspaceMember(workspaceId, dbUser.id);

    const memberships = await db.conversationMember.findMany({
        where: {
            userId: dbUser.id,
            conversation: { workspaceId },
        },
        include: {
            conversation: {
                include: {
                    members: {
                        include: {
                            user: {
                                select: { id: true, name: true, avatarUrl: true, clerkId: true },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { conversation: { lastMessageAt: "desc" } },
    });

    return memberships.map((m) => {
        const conv = m.conversation;
        const otherMembers = conv.members
            .filter((cm) => cm.userId !== dbUser.id)
            .map((cm) => cm.user);

        let displayName = conv.name;
        if (!displayName) {
            if (conv.type === "DM") {
                displayName = otherMembers[0]?.name || "Unknown";
            } else if (conv.type === "GROUP_DM") {
                displayName = otherMembers.map((u) => u.name.split(" ")[0]).join(", ");
            }
        }

        return {
            id: conv.id,
            type: conv.type,
            name: displayName || "Conversation",
            description: conv.description,
            visibility: conv.visibility,
            lastMessageAt: conv.lastMessageAt,
            lastMessageText: conv.lastMessageText,
            lastSenderId: conv.lastSenderId,
            lastReadAt: m.lastReadAt,
            members: conv.members.map((cm) => ({
                userId: cm.user.id,
                clerkId: cm.user.clerkId,
                name: cm.user.name,
                avatarUrl: cm.user.avatarUrl,
                lastReadAt: cm.lastReadAt,
            })),
            otherMembers,
            createdAt: conv.createdAt,
        };
    });
}

// ──────────────────────────────────────────
// DMs: Get or Create
// ──────────────────────────────────────────

export async function getOrCreateDM(workspaceId: string, targetUserId: string) {
    const dbUser = await requireDbUser();
    if (dbUser.id === targetUserId) throw new Error("Cannot DM yourself.");

    await requireWorkspaceMember(workspaceId, dbUser.id);
    await requireWorkspaceMember(workspaceId, targetUserId);

    const existing = await db.conversation.findFirst({
        where: {
            workspaceId,
            type: "DM",
            AND: [
                { members: { some: { userId: dbUser.id } } },
                { members: { some: { userId: targetUserId } } },
            ],
        },
        include: {
            members: {
                include: {
                    user: { select: { id: true, name: true, avatarUrl: true, clerkId: true } },
                },
            },
        },
    });

    if (existing) return existing;

    const conversation = await db.conversation.create({
        data: {
            type: "DM",
            workspaceId,
            createdById: dbUser.id,
            members: {
                create: [
                    { userId: dbUser.id },
                    { userId: targetUserId },
                ],
            },
        },
        include: {
            members: {
                include: {
                    user: { select: { id: true, name: true, avatarUrl: true, clerkId: true } },
                },
            },
        },
    });

    return conversation;
}

// ──────────────────────────────────────────
// Group DMs: Create
// ──────────────────────────────────────────

export async function createGroupDM(workspaceId: string, memberIds: string[], name?: string) {
    const dbUser = await requireDbUser();
    await requireWorkspaceMember(workspaceId, dbUser.id);

    const allMemberIds = Array.from(new Set([dbUser.id, ...memberIds]));
    if (allMemberIds.length < 3) throw new Error("Group DM requires at least 3 participants.");
    if (allMemberIds.length > GROUP_DM_MAX) throw new Error(`Group DM cannot exceed ${GROUP_DM_MAX} participants.`);

    for (const uid of allMemberIds) {
        if (uid !== dbUser.id) {
            await requireWorkspaceMember(workspaceId, uid);
        }
    }

    const conversation = await db.conversation.create({
        data: {
            type: "GROUP_DM",
            workspaceId,
            name: name || null,
            createdById: dbUser.id,
            members: {
                create: allMemberIds.map((uid) => ({ userId: uid })),
            },
        },
        include: {
            members: {
                include: {
                    user: { select: { id: true, name: true, avatarUrl: true, clerkId: true } },
                },
            },
        },
    });

    return conversation;
}

// ──────────────────────────────────────────
// Channels: Create
// ──────────────────────────────────────────

export async function createChannel(
    workspaceId: string,
    data: { name: string; description?: string; visibility?: ChannelVisibility }
) {
    const dbUser = await requireDbUser();
    await requireWorkspaceMember(workspaceId, dbUser.id);

    const sanitizedName = data.name
        .toLowerCase()
        .replace(/[^a-z0-9-_\s]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 50);

    if (sanitizedName.length < 2) throw new Error("Channel name must be at least 2 characters.");

    const existingChannel = await db.conversation.findFirst({
        where: { workspaceId, type: "CHANNEL", name: sanitizedName },
    });
    if (existingChannel) throw new Error(`Channel #${sanitizedName} already exists.`);

    const conversation = await db.conversation.create({
        data: {
            type: "CHANNEL",
            workspaceId,
            name: sanitizedName,
            description: data.description || null,
            visibility: data.visibility || "PUBLIC",
            createdById: dbUser.id,
            members: {
                create: [{ userId: dbUser.id }],
            },
        },
        include: {
            members: {
                include: {
                    user: { select: { id: true, name: true, avatarUrl: true, clerkId: true } },
                },
            },
        },
    });

    return conversation;
}

// ──────────────────────────────────────────
// Channels: Join
// ──────────────────────────────────────────

export async function joinChannel(workspaceId: string, conversationId: string) {
    const dbUser = await requireDbUser();
    await requireWorkspaceMember(workspaceId, dbUser.id);

    const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
    });
    if (!conversation || conversation.workspaceId !== workspaceId) {
        throw new Error("Channel not found.");
    }
    if (conversation.type !== "CHANNEL") throw new Error("Can only join channels.");
    if (conversation.visibility === "PRIVATE") throw new Error("Cannot join private channels without an invite.");

    const existing = await db.conversationMember.findUnique({
        where: { conversationId_userId: { conversationId, userId: dbUser.id } },
    });
    if (existing) return conversation;

    await db.conversationMember.create({
        data: { conversationId, userId: dbUser.id },
    });

    return conversation;
}

// ──────────────────────────────────────────
// Channels: Browse public channels
// ──────────────────────────────────────────

export async function getPublicChannels(workspaceId: string) {
    const dbUser = await requireDbUser();
    await requireWorkspaceMember(workspaceId, dbUser.id);

    const channels = await db.conversation.findMany({
        where: {
            workspaceId,
            type: "CHANNEL",
            visibility: "PUBLIC",
        },
        include: {
            _count: { select: { members: true } },
            members: {
                where: { userId: dbUser.id },
                select: { id: true },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    return channels.map((ch) => ({
        id: ch.id,
        name: ch.name!,
        description: ch.description,
        memberCount: ch._count.members,
        isMember: ch.members.length > 0,
        createdAt: ch.createdAt,
    }));
}

// ──────────────────────────────────────────
// Messages: Send
// ──────────────────────────────────────────

export async function sendMessage(
    conversationId: string,
    content: string,
    mentions: string[] = []
) {
    const dbUser = await requireDbUser();
    const trimmed = content.trim();
    if (!trimmed) throw new Error("Message cannot be empty.");
    if (trimmed.length > 4000) throw new Error("Message too long (max 4000 chars).");

    await requireConversationMember(conversationId, dbUser.id);

    const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        select: { workspaceId: true },
    });
    if (!conversation) throw new Error("Conversation not found.");

    await requireWorkspaceMember(conversation.workspaceId, dbUser.id);

    const validMentions = mentions.length > 0
        ? await db.workspaceMember.findMany({
              where: {
                  workspaceId: conversation.workspaceId,
                  userId: { in: mentions },
              },
              select: { userId: true },
          }).then((m) => m.map((r) => r.userId))
        : [];

    const previewText = trimmed.length > 120 ? trimmed.substring(0, 120) + "…" : trimmed;

    const [message] = await Promise.all([
        db.message.create({
            data: {
                conversationId,
                senderId: dbUser.id,
                content: trimmed,
                mentions: validMentions,
            },
            include: {
                sender: {
                    select: { id: true, name: true, avatarUrl: true, clerkId: true },
                },
            },
        }),
        db.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessageAt: new Date(),
                lastMessageText: previewText,
                lastSenderId: dbUser.id,
            },
        }),
        db.conversationMember.update({
            where: { conversationId_userId: { conversationId, userId: dbUser.id } },
            data: { lastReadAt: new Date() },
        }),
    ]);

    return {
        id: message.id,
        conversationId: message.conversationId,
        content: message.content,
        mentions: message.mentions,
        isSystem: message.isSystem,
        sender: message.sender,
        createdAt: message.createdAt,
    };
}

// ──────────────────────────────────────────
// Messages: Paginated fetch (cursor-based)
// ──────────────────────────────────────────

export async function getMessages(
    conversationId: string,
    options?: { before?: string; limit?: number }
) {
    const dbUser = await requireDbUser();
    await requireConversationMember(conversationId, dbUser.id);

    const limit = Math.min(options?.limit || 30, 50);

    const messages = await db.message.findMany({
        where: {
            conversationId,
            ...(options?.before ? { id: { lt: options.before } } : {}),
        },
        include: {
            sender: {
                select: { id: true, name: true, avatarUrl: true, clerkId: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
    });

    const hasMore = messages.length > limit;
    const slice = hasMore ? messages.slice(0, limit) : messages;

    return {
        messages: slice.reverse(),
        hasMore,
        nextCursor: hasMore ? slice[0]?.id : null,
    };
}

// ──────────────────────────────────────────
// Read Receipts
// ──────────────────────────────────────────

export async function markAsRead(conversationId: string) {
    const dbUser = await requireDbUser();

    await db.conversationMember.update({
        where: { conversationId_userId: { conversationId, userId: dbUser.id } },
        data: { lastReadAt: new Date() },
    });

    return { success: true };
}

// ──────────────────────────────────────────
// Unread Counts (batch for sidebar)
// ──────────────────────────────────────────

export async function getUnreadCounts(workspaceId: string) {
    const dbUser = await requireDbUser();
    await requireWorkspaceMember(workspaceId, dbUser.id);

    const memberships = await db.conversationMember.findMany({
        where: {
            userId: dbUser.id,
            conversation: { workspaceId },
        },
        select: {
            conversationId: true,
            lastReadAt: true,
        },
    });

    const counts: Record<string, number> = {};

    await Promise.all(
        memberships.map(async (m) => {
            const count = await db.message.count({
                where: {
                    conversationId: m.conversationId,
                    createdAt: { gt: m.lastReadAt },
                    senderId: { not: dbUser.id },
                },
            });
            if (count > 0) counts[m.conversationId] = count;
        })
    );

    return counts;
}

// ──────────────────────────────────────────
// @Mentions Feed (Threads tab)
// ──────────────────────────────────────────

export async function getMentionsFeed(workspaceId: string, cursor?: string) {
    const dbUser = await requireDbUser();
    await requireWorkspaceMember(workspaceId, dbUser.id);

    const messages = await db.message.findMany({
        where: {
            conversation: { workspaceId },
            mentions: { has: dbUser.id },
            senderId: { not: dbUser.id },
            ...(cursor ? { id: { lt: cursor } } : {}),
        },
        include: {
            sender: {
                select: { id: true, name: true, avatarUrl: true, clerkId: true },
            },
            conversation: {
                select: { id: true, type: true, name: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 31,
    });

    const hasMore = messages.length > 30;
    const slice = hasMore ? messages.slice(0, 30) : messages;

    return {
        messages: slice,
        hasMore,
        nextCursor: hasMore ? slice[slice.length - 1]?.id : null,
    };
}

// ──────────────────────────────────────────
// Leave conversation
// ──────────────────────────────────────────

export async function leaveConversation(conversationId: string) {
    const dbUser = await requireDbUser();

    const membership = await db.conversationMember.findUnique({
        where: { conversationId_userId: { conversationId, userId: dbUser.id } },
    });
    if (!membership) throw new Error("Not a member.");

    const conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        select: { type: true },
    });

    if (conversation?.type === "DM") throw new Error("Cannot leave a DM.");

    await db.conversationMember.delete({
        where: { conversationId_userId: { conversationId, userId: dbUser.id } },
    });

    return { success: true };
}
