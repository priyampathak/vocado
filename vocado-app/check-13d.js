const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const ts13d = await prisma.teamspace.findMany({
        where: { workspaceId: "69a98b6f7ecc23c8700c913d" },
        include: { members: true }
    });
    console.log("Teamspaces in 13d:", JSON.stringify(ts13d, null, 2));

    const user = await prisma.user.findFirst({
        where: { email: { contains: 'priyam' } }
    });
    console.log("Priyam User ID:", user?.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
