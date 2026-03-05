import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Clear all workspace members first (due to foreign keys)
    const deletedMembers = await prisma.workspaceMember.deleteMany()
    console.log(`Deleted ${deletedMembers.count} workspace members`)

    // Clear all workspaces 
    const deletedWorkspaces = await prisma.workspace.deleteMany()
    console.log(`Deleted ${deletedWorkspaces.count} workspaces`)

    // Clear all users
    const deletedUsers = await prisma.user.deleteMany()
    console.log(`Deleted ${deletedUsers.count} users`)

    console.log('\nDatabase cleared! You can now sign up fresh.')
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
