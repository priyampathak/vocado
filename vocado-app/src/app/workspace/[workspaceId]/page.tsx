import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Check,
  CheckSquare,
  MessageSquare,
  ListTodo,
  Paperclip,
  MoreHorizontal,
  TrendingUp,
  Users,
  Clock,
  Target,
} from "lucide-react";

interface TaskItem {
  name: string;
  description: string;
  assignees: string[];
  dueDate: string;
  priority: string;
  progress: number;
  parent?: string;
  subtasks?: number;
  checked?: boolean;
}

interface Category {
  title: string;
  count: number;
  badgeColor: string;
  tasks: TaskItem[];
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  const stats = [
    { label: "Active Tasks", value: "24", icon: Target, trend: "+3", color: "oklch(0.55 0.14 135)" },
    { label: "Team Members", value: "12", icon: Users, trend: "+1", color: "oklch(0.55 0.15 250)" },
    { label: "Hours Tracked", value: "182", icon: Clock, trend: "+18", color: "oklch(0.6 0.12 300)" },
    { label: "Completion Rate", value: "87%", icon: TrendingUp, trend: "+5%", color: "oklch(0.7 0.15 150)" },
  ];

  const categories: Category[] = [
    {
      title: "In Progress",
      count: 2,
      badgeColor: "bg-[oklch(0.75_0.15_60)]/20 text-[oklch(0.55_0.15_60)]",
      tasks: [
        {
          name: "Wireframing",
          subtasks: 3,
          description: "Create wireframes for core screens",
          assignees: ["GT", "HQ", "TB"],
          dueDate: "Feb 12, 2026",
          priority: "Urgent",
          progress: 85,
        },
        {
          name: "Dashboard",
          parent: "Wireframing",
          description: "Create wireframe for Dashboard page",
          assignees: ["AN", "HG"],
          dueDate: "Feb 12, 2026",
          priority: "Urgent",
          progress: 95,
          checked: true,
        },
        {
          name: "Hi-Fi Design",
          subtasks: 3,
          description: "Create hi-fi design for 3 main screens",
          assignees: ["NZ", "RY", "FG"],
          dueDate: "Feb 14, 2026",
          priority: "Low",
          progress: 20,
        },
      ],
    },
    {
      title: "Ready for Review",
      count: 2,
      badgeColor: "bg-[oklch(0.65_0.15_250)]/10 text-[oklch(0.55_0.15_250)]",
      tasks: [
        {
          name: "Onboarding Flow",
          subtasks: 3,
          description: "Complete onboarding wireframes",
          assignees: ["GT", "HQ", "TB"],
          dueDate: "Feb 8, 2026",
          priority: "Urgent",
          progress: 100,
          checked: true,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[oklch(0.93_0.01_130)] transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.07)]"
          >
            <div className="flex items-center justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `color-mix(in oklch, ${stat.color} 12%, white)` }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.7_0.15_150)]/10 px-2 py-0.5 text-[11px] font-semibold text-[oklch(0.55_0.12_150)]">
                <TrendingUp className="h-3 w-3" />
                {stat.trend}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-[oklch(0.2_0.03_135)]">{stat.value}</p>
            <p className="mt-0.5 text-[12px] font-medium text-[oklch(0.55_0.04_135)]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tasks Table */}
      <div className="rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[oklch(0.93_0.01_130)] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[minmax(220px,1fr)_minmax(250px,2fr)_100px_130px_90px_100px_50px] items-center gap-4 border-b border-[oklch(0.93_0.01_130)] bg-[oklch(0.98_0.005_135)] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[oklch(0.55_0.04_135)]">
          <div>Task</div>
          <div>Description</div>
          <div>Assignee</div>
          <div>Due Date</div>
          <div>Priority</div>
          <div>Progress</div>
          <div />
        </div>

        {/* Categories */}
        {categories.map((category, catIdx) => (
          <div key={catIdx} className="flex flex-col">
            {/* Category Header */}
            <div className="flex items-center gap-2 border-b border-[oklch(0.93_0.01_130)]/50 bg-[oklch(0.99_0.005_135)] px-5 py-2.5">
              <span className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${category.badgeColor}`}>
                {category.title}
              </span>
              <span className="flex h-5 items-center justify-center rounded-md bg-[oklch(0.95_0.02_130)] px-1.5 text-[10px] font-medium text-[oklch(0.55_0.04_135)]">
                {category.count}
              </span>
            </div>

            {/* Task List */}
            <div className="flex flex-col">
              {category.tasks.map((task, taskIdx) => (
                <div
                  key={taskIdx}
                  className={`group grid grid-cols-[minmax(220px,1fr)_minmax(250px,2fr)_100px_130px_90px_100px_50px] items-center gap-4 border-b border-[oklch(0.93_0.01_130)]/30 px-5 py-3 text-[13px] transition-colors hover:bg-[oklch(0.98_0.005_135)] last:border-0 ${task.parent ? "pl-10" : ""}`}
                >
                  {/* Task Name */}
                  <div className="flex items-center gap-2.5">
                    {task.parent ? (
                      <CheckSquare className="h-4 w-4 text-[oklch(0.6_0.04_135)]" />
                    ) : (
                      <ListTodo className="h-4 w-4 text-[oklch(0.6_0.04_135)]" />
                    )}
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border ${task.checked
                        ? "border-[oklch(0.55_0.14_135)] bg-[oklch(0.55_0.14_135)] text-white"
                        : "border-[oklch(0.85_0.02_135)] text-transparent"
                        }`}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                    <span className={`font-medium ${task.checked ? "text-[oklch(0.5_0.03_135)] line-through" : "text-[oklch(0.25_0.03_135)]"}`}>
                      {task.name}
                    </span>
                    {task.subtasks && (
                      <Badge variant="outline" className="h-5 gap-1 border-[oklch(0.9_0.01_130)] bg-white px-1.5 text-[10px] text-[oklch(0.55_0.04_135)]">
                        <ListTodo className="h-3 w-3" />
                        {task.subtasks}
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <div className="truncate text-[12.5px] text-[oklch(0.55_0.03_135)]">
                    {task.description}
                  </div>

                  {/* Assignees */}
                  <div className="flex -space-x-1.5">
                    {task.assignees.map((initials, i) => (
                      <Avatar key={i} className="h-6 w-6 border-2 border-white ring-0">
                        <AvatarFallback
                          className={`text-[9px] font-semibold text-white ${i % 3 === 0 ? "bg-[oklch(0.55_0.14_135)]" : i % 3 === 1 ? "bg-[oklch(0.55_0.15_250)]" : "bg-[oklch(0.6_0.12_300)]"
                            }`}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>

                  {/* Due Date */}
                  <div className="text-[12px] text-[oklch(0.55_0.03_135)]">{task.dueDate}</div>

                  {/* Priority */}
                  <div>
                    <Badge
                      variant="outline"
                      className={`h-6 rounded-lg border-0 px-2 text-[11px] font-semibold ${task.priority === "Urgent"
                        ? "bg-[oklch(0.6_0.18_20)]/10 text-[oklch(0.55_0.18_20)]"
                        : "bg-[oklch(0.95_0.02_130)] text-[oklch(0.55_0.04_135)]"
                        }`}
                    >
                      {task.priority}
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[oklch(0.94_0.02_130)] overflow-hidden">
                      <div className="h-full rounded-full bg-[oklch(0.55_0.14_135)]" style={{ width: `${task.progress}%` }} />
                    </div>
                    <span className="w-8 text-[10px] font-semibold text-[oklch(0.55_0.04_135)]">
                      {task.progress}%
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="rounded p-1 text-[oklch(0.6_0.04_135)] hover:bg-[oklch(0.96_0.02_130)]">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center px-5 py-3 border-b border-[oklch(0.93_0.01_130)]/30 text-[13px] text-[oklch(0.6_0.04_135)] hover:text-[oklch(0.35_0.04_135)] cursor-pointer transition-colors">
                <span className="mr-2">+</span> Add task
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
