import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getWorkspaceTeamspaces(workspaceId, dbUserId) {
    const workspaceMembership = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: dbUserId, workspaceId } },
    });
    const isWorkspaceAdmin = workspaceMembership.role === "ADMIN" || workspaceMembership.role === "OWNER";

    console.log("Workspace Role:", workspaceMembership.role, "isAdmin?", isWorkspaceAdmin);

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
                include: { user: true },
            },
            _count: {
                select: { folders: true, plots: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return teamspaces.map((ts) => ({
        ...ts,
        userRole: ts.members.find((m) => m.userId === dbUserId)?.role || null,
    }));
}

async function getTeamspaceTree(workspaceId, dbUserId) {
    const membership = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: dbUserId, workspaceId } },
    });
    const isWorkspaceAdmin = membership.role === "ADMIN" || membership.role === "OWNER";

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
                select: { role: true },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    return teamspaces;
}

async function main() {
    const workspaceId = "69a98b6f7ecc23c8700c913d";
    const memberUserId = "69a98c0e7ecc23c8700c913f";

    const list = await getWorkspaceTeamspaces(workspaceId, memberUserId);
    console.log("TEST USER list:", JSON.stringify(list, null, 2));

    const tree = await getTeamspaceTree(workspaceId, memberUserId);
    console.log("TEST USER tree:", JSON.stringify(tree, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
