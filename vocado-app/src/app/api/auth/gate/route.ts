import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dbUser = await db.user.findUnique({
            where: { clerkId: userId },
            include: {
                workspaces: {
                    include: {
                        workspace: true,
                    },
                    take: 1, // Only need the first one
                },
            },
        });

        if (!dbUser) {
            // User just signed up, webhook might be delayed
            return NextResponse.json({ hasWorkspaces: false, firstWorkspaceId: null });
        }

        const hasWorkspaces = dbUser.workspaces.length > 0;
        const firstWorkspaceId = hasWorkspaces ? dbUser.workspaces[0].workspaceId : null;

        return NextResponse.json({ hasWorkspaces, firstWorkspaceId });
    } catch (error) {
        console.error("Error in gate check:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
