const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const teamspaces = await prisma.teamspace.findMany({
        include: { members: true }
    });
    console.log("All Teamspaces:", JSON.stringify(teamspaces, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
