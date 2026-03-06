import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log("Users:", users.map(u => ({ id: u.id, email: u.email })));

    const workspaceId = "69a98b6f7ecc23c8700c913d";

    const wMembers = await prisma.workspaceMember.findMany({
        where: { workspaceId }
    });
    console.log("Workspace Members:", wMembers.map(m => ({ id: m.userId, role: m.role })));

    const teamspaces = await prisma.teamspace.findMany({
        where: { workspaceId },
        include: { members: true }
    });

    console.log("Teamspaces:", JSON.stringify(teamspaces, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
