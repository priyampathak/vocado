import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getTeamspaceTree(workspaceId, dbUserId) {
    const membership = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: dbUserId, workspaceId } },
    });
    console.log("Workspace Membership:", membership);

    if (!membership) return [];

    const isWorkspaceAdmin = membership.role === "ADMIN" || membership.role === "OWNER";
    console.log("Is Workspace Admin?", isWorkspaceAdmin);

    const teamspaces = await prisma.teamspace.findMany({
        where: {
            workspaceId,
            ...(isWorkspaceAdmin ? {} : {
                members: {
                    some: { userId: dbUserId },
                },
            }),
        },
        include: {
            members: {
                where: { userId: dbUserId },
                select: { role: true, userId: true },
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

async function main() {
    const workspaceId = "69a98c0e7ecc23c8700c9140";
    const userId = "69a98b6f7ecc23c8700c913c"; // Priyam

    const tree = await getTeamspaceTree(workspaceId, userId);
    console.log("Teamspace Tree for Priyam:", JSON.stringify(tree, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
