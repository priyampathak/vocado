import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public pages that require no authentication check
const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)"
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isWorkspaceRoute = createRouteMatcher(["/workspace(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth();

    if (userId) {
        const onboarded = (sessionClaims?.metadata as any)?.onboarded === true;
        const defaultWorkspaceId = (sessionClaims?.metadata as any)?.defaultWorkspaceId as string | undefined;

        const isAuthPage = req.nextUrl.pathname.startsWith("/sign-in") || req.nextUrl.pathname.startsWith("/sign-up");
        const isLandingPage = req.nextUrl.pathname === "/";
        const isApiRoute = req.nextUrl.pathname.startsWith("/api");

        // Bridge signal: Server Actions set a cookie, OR layouts append ?_bridge=true
        // to signal that the user just completed onboarding. This bridges the gap
        // between Clerk metadata update and JWT refresh (can take a few seconds).
        const justOnboarded = req.cookies.get("vocado_onboarded")?.value === "true" || req.nextUrl.searchParams.get("_bridge") === "true";

        // If user just completed onboarding (cookie bridge) and is heading to a workspace,
        // let them through immediately — don't wait for the JWT to refresh.
        if (justOnboarded && isWorkspaceRoute(req)) {
            const response = NextResponse.next();
            // Clear the bridge cookie now that they've landed
            response.cookies.delete("vocado_onboarded");
            return response;
        }

        // SCENARIO 1: User is NOT onboarded (no workspaces) per JWT claims.
        // Force them to /onboarding — but allow workspace routes through
        // (in case they just created one and the JWT is stale).
        if (!onboarded && !justOnboarded && !isOnboardingRoute(req) && !isApiRoute && !isWorkspaceRoute(req)) {
            return NextResponse.redirect(new URL("/onboarding", req.url));
        }

        // SCENARIO 2: User IS onboarded (has a default workspace).
        // Bypass onboarding/landing/auth and route them to their workspace.
        if (onboarded && defaultWorkspaceId && (isOnboardingRoute(req) || isLandingPage || isAuthPage)) {
            return NextResponse.redirect(new URL(`/workspace/${defaultWorkspaceId}`, req.url));
        }

        // SCENARIO 3: User IS onboarded but doesn't have a workspace ID cached.
        // Send them to onboarding to recover state.
        if (onboarded && !defaultWorkspaceId && !isOnboardingRoute(req) && !isApiRoute && !isWorkspaceRoute(req)) {
            return NextResponse.redirect(new URL(`/onboarding`, req.url));
        }
    }

    // Prevent unauthorized access to all protected routes
    if (!isPublicRoute(req)) {
        await auth.protect();
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
