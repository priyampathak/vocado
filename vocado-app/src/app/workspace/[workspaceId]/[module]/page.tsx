import { CalendarDays, Mail, Building2, Users, Construction } from "lucide-react";

const moduleConfig: Record<string, { title: string; description: string; icon: React.ElementType; color: string }> = {
    mailbox: {
        title: "Mailbox",
        description: "Unified email integration portal — connect Gmail, Outlook, and Zoho.",
        icon: Mail,
        color: "oklch(0.6 0.15 20)",
    },
    calendar: {
        title: "Calendar",
        description: "Your live master calendar with events, deadlines, and meetings.",
        icon: CalendarDays,
        color: "oklch(0.55 0.15 250)",
    },
    workspaces: {
        title: "Workspaces",
        description: "Manage workspace settings, members, and roles.",
        icon: Building2,
        color: "oklch(0.55 0.14 135)",
    },
    teamspaces: {
        title: "Teamspaces",
        description: "Create and manage Teamspaces for collaborative work.",
        icon: Users,
        color: "oklch(0.6 0.12 300)",
    },
};

export default async function ModulePage({
    params,
}: {
    params: Promise<{ workspaceId: string; module: string }>;
}) {
    const { module } = await params;
    const config = moduleConfig[module];

    if (!config) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="rounded-3xl bg-white p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[oklch(0.93_0.01_130)]">
                    <Construction className="mx-auto h-12 w-12 text-[oklch(0.6_0.04_135)]" />
                    <h2 className="mt-4 text-xl font-bold text-[oklch(0.25_0.03_135)]">Module Not Found</h2>
                    <p className="mt-2 text-sm text-[oklch(0.55_0.04_135)]">
                        The module &quot;{module}&quot; does not exist yet.
                    </p>
                </div>
            </div>
        );
    }

    const IconComponent = config.icon;

    return (
        <div className="flex h-full items-center justify-center">
            <div className="max-w-lg rounded-3xl bg-white p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[oklch(0.93_0.01_130)]">
                <div
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `color-mix(in oklch, ${config.color} 15%, white)` }}
                >
                    <IconComponent
                        className="h-8 w-8"
                        style={{ color: config.color }}
                    />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-[oklch(0.2_0.03_135)]">{config.title}</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-[oklch(0.5_0.04_135)]">
                    {config.description}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[oklch(0.96_0.02_130)] px-4 py-2 text-[12px] font-semibold text-[oklch(0.5_0.06_135)]">
                    <Construction className="h-3.5 w-3.5" />
                    Coming Soon
                </div>
            </div>
        </div>
    );
}
