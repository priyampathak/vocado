const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const workspaceId = "69a98c0e7ecc23c8700c9140";
    const userId = "69a98b6f7ecc23c8700c913c"; // priyam

    const wMember = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } }
    });
    console.log("Workspace Member for Priyam in 140:", wMember);

    const tMember = await prisma.teamspaceMember.findMany({
        where: { userId, teamspace: { workspaceId } }
    });
    console.log("Teamspace Memberships for Priyam in 140:", tMember);
}

main().catch(console.error).finally(() => prisma.$disconnect());
