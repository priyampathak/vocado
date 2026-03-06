const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const workspaceId = "69a98c0e7ecc23c8700c9140";
    const userId = "69a98b6f7ecc23c8700c913c"; // priyam

    const teamspaces = await prisma.teamspace.findMany({
        where: {
            workspaceId,
            members: {
                some: { userId: userId },
            },
        },
        include: {
            members: {
                include: { user: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    console.log("Teamspaces for Priyam:", JSON.stringify(teamspaces, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
