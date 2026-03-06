const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { email: 'iampriyampathak@gmail.com' }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log('User ID:', user.id);
    console.log('User Name:', user.name);

    // Get all workspaces this user is part of
    const workspaceMemberships = await prisma.workspaceMember.findMany({
        where: { userId: user.id },
        include: { workspace: true }
    });

    console.log('\n--- Workspace Memberships ---');
    workspaceMemberships.forEach(m => {
        console.log(`Workspace: ${m.workspace.name} (ID: ${m.workspace.id}, Role: ${m.role})`);
    });

    // Get all teamspaces this user is part of
    const teamspaceMemberships = await prisma.teamspaceMember.findMany({
        where: { userId: user.id },
        include: {
            teamspace: {
                include: {
                    workspace: true
                }
            }
        }
    });

    console.log('\n--- Teamspace Memberships ---');
    console.log('Total Teamspaces:', teamspaceMemberships.length);
    teamspaceMemberships.forEach(m => {
        console.log(`Teamspace: ${m.teamspace.name}`);
        console.log(`  ID: ${m.teamspace.id}`);
        console.log(`  Workspace: ${m.teamspace.workspace.name} (${m.teamspace.workspaceId})`);
        console.log(`  Role in Teamspace: ${m.role}`);
        console.log('------------------');
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
