import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    // 1. Hard check Prisma to see if they genuinely have workspaces
    // This catches scenarios where the Clerk Session JWT doesn't have publicMetadata configured natively.
    const dbUser = await db.user.findUnique({
        where: { clerkId: userId },
        include: {
            workspaces: {
                take: 1, // Only need one to know they've onboarded
            },
        },
    });

    if (dbUser && dbUser.workspaces.length > 0) {
        const workspaceId = dbUser.workspaces[0].workspaceId;

        // 2. Recover their Clerk Metadata for future Edge routing
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
            publicMetadata: {
                onboarded: true,
                defaultWorkspaceId: workspaceId,
            },
        });

        // 3. Redirect them to their existing workspace instead of showing the UI
        // We append ?_bridge=true so the edge middleware knows to let them through instantly
        redirect(`/workspace/${workspaceId}?_bridge=true`);
    }

    return <>{children}</>;
}
