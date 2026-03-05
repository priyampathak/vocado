import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, CheckSquare, MessageSquare, ListTodo, Paperclip, MoreHorizontal } from "lucide-react";

export default function Home() {
  const categories = [
    {
      title: "In Progress",
      count: 2,
      badgeColor: "bg-warning/20 text-warning",
      tasks: [
        {
          name: "Wireframing",
          subtasks: 3,
          description: "-",
          assignees: ["GT", "HQ", "TB"],
          dueDate: "February 12, 2024",
          priority: "Urgent",
          progress: 85,
        },
        {
          name: "Dashboard",
          parent: "Wireframing",
          description: "Create wireframe for Dashboard page",
          assignees: ["AN", "HG"],
          dueDate: "February 12, 2024",
          priority: "Urgent",
          progress: 95,
          checked: true,
        },
        {
          name: "Analytics",
          parent: "Wireframing",
          description: "Create wireframe for analytics page",
          assignees: ["GT", "HQ", "TB"],
          dueDate: "February 12, 2024",
          priority: "Urgent",
          progress: 100,
          checked: true,
        },
        {
          name: "Messages",
          parent: "Wireframing",
          description: "Create wireframe for messages page",
          assignees: ["AN", "HG"],
          dueDate: "February 12, 2024",
          priority: "Normal",
          progress: 34,
          checked: false,
        },
        {
          name: "Hi-Fi Design",
          subtasks: 3,
          description: "Create hi-fi design 3 main screen",
          assignees: ["NZ", "RY", "FG", "RO"],
          dueDate: "February 14, 2024",
          priority: "Low",
          progress: 20,
        },
        {
          name: "Dashboard",
          parent: "Hi-Fi Design",
          comments: 2,
          description: "Create hi-fi a design Onboarding step by step.",
          assignees: ["GT", "HQ", "TB"],
          dueDate: "February 14, 2024",
          priority: "Low",
          progress: 20,
        },
        {
          name: "Analytics",
          parent: "Hi-Fi Design",
          comments: 6,
          description: "Create hi-fi a design a login screen step by step.",
          assignees: ["AN", "HG"],
          dueDate: "February 14, 2024",
          priority: "Low",
          progress: 20,
        },
      ],
    },
    {
      title: "Ready to check by PM",
      count: 2,
      badgeColor: "bg-info/10 text-info",
      tasks: [
        {
          name: "Wireframing",
          subtasks: 3,
          description: "-",
          assignees: ["GT", "HQ", "TB"],
          dueDate: "February 8, 2024",
          priority: "Urgent",
          progress: 100,
          checked: true,
        },
        {
          name: "Onboarding",
          parent: "Wireframing",
          comments: 2,
          description: "-",
          assignees: ["AN", "HG"],
          dueDate: "February 8, 2024",
          priority: "Urgent",
          progress: 95,
          checked: true,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="rounded-xl border border-border bg-card p-0 shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-[minmax(250px,1fr)_minmax(300px,2fr)_120px_160px_100px_100px_60px] items-center gap-4 border-b border-border bg-muted/20 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div>Task</div>
          <div>Description</div>
          <div>Assignee</div>
          <div>Due Date</div>
          <div>Priority</div>
          <div>Progress</div>
          <div className="flex justify-end pr-2">Crea</div>
        </div>

        {/* Categories */}
        {categories.map((category, catIdx) => (
          <div key={catIdx} className="flex flex-col">
            {/* Category Header */}
            <div className="flex items-center gap-2 border-y border-border/50 bg-background/50 px-6 py-3 first:border-t-0">
              <span className={`rounded-md px-2 py-1 text-xs font-semibold ${category.badgeColor}`}>
                {category.title}
              </span>
              <span className="flex h-5 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                {category.count}
              </span>
              <button className="ml-1 text-muted-foreground/50 hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Task List */}
            <div className="flex flex-col">
              {category.tasks.map((task, taskIdx) => (
                <div
                  key={taskIdx}
                  className={`group grid grid-cols-[minmax(250px,1fr)_minmax(300px,2fr)_120px_160px_100px_100px_60px] items-center gap-4 border-b border-border/40 px-6 py-3 text-sm transition-colors hover:bg-muted/30 last:border-0 ${task.parent ? "pl-12" : ""
                    }`}
                >
                  {/* Task Name Column */}
                  <div className="flex items-center gap-2.5">
                    {task.parent ? (
                      <div className="flex h-5 w-5 items-center justify-center text-muted-foreground/40">
                        <CheckSquare className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="text-muted-foreground/40">
                        <ListTodo className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border ${task.checked
                          ? "border-brand bg-brand text-white"
                          : "border-border text-transparent"
                        }`}
                    >
                      <Check className="h-3 w-3" />
                    </div>

                    <span
                      className={`font-medium ${task.checked ? "text-foreground line-through opacity-70" : "text-foreground"
                        }`}
                    >
                      {task.name}
                    </span>

                    {task.subtasks && (
                      <Badge variant="outline" className="h-5 gap-1 border-border/60 bg-background px-1.5 text-[10px] text-muted-foreground">
                        <ListTodo className="h-3 w-3" />
                        {task.subtasks}
                      </Badge>
                    )}

                    {task.comments && (
                      <Badge variant="outline" className="h-5 gap-1 border-border/60 bg-background px-1.5 text-[10px] text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        {task.comments}
                      </Badge>
                    )}
                  </div>

                  {/* Description Column */}
                  <div className="truncate pr-4 text-[13px] text-muted-foreground">
                    {task.description}
                  </div>

                  {/* Assignees Column */}
                  <div className="flex -space-x-1.5">
                    {task.assignees.map((initials, i) => (
                      <Avatar key={i} className="h-6 w-6 border-2 border-card ring-0">
                        <AvatarFallback
                          className={`text-[9px] font-semibold text-white ${i % 3 === 0
                              ? "bg-brand"
                              : i % 3 === 1
                                ? "bg-info"
                                : "bg-warning"
                            }`}
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>

                  {/* Due Date Column */}
                  <div className="text-[13px] text-muted-foreground">
                    {task.dueDate}
                  </div>

                  {/* Priority Column */}
                  <div>
                    <Badge
                      variant="outline"
                      className={`h-6 rounded-md border-0 bg-opacity-10 px-2 text-xs font-medium ${task.priority === "Urgent"
                          ? "bg-destructive/10 text-destructive"
                          : task.priority === "Normal"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {task.priority === "Urgent" && <span className="mr-1 text-destructive">⚑</span>}
                      {task.priority === "Normal" && <span className="mr-1 text-success">⚑</span>}
                      {task.priority === "Low" && <span className="mr-1 text-muted-foreground">⚑</span>}
                      {task.priority}
                    </Badge>
                  </div>

                  {/* Progress Column */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-brand"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="w-8 text-[11px] font-medium text-muted-foreground">
                      {task.progress}%
                    </span>
                  </div>

                  {/* Creation/Actions Column */}
                  <div className="flex items-center justify-end gap-1 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="rounded p-1 hover:bg-muted hover:text-foreground">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button className="rounded p-1 hover:bg-muted hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center px-6 py-3 border-b border-border/50 text-sm text-muted-foreground/70 hover:text-foreground cursor-pointer last:border-0 transition-colors">
              <span className="mr-2">+</span> Add task
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
