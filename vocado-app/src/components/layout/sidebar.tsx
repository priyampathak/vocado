"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  Users,
  UserCheck,
  UserPlus,
  Star,
  FolderOpen,
  Plus,
  Settings,
  HelpCircle,
  ChevronDown,
  MoreHorizontal,
  Hash,
  ChevronRight,
  ListTodo,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  badge?: number;
  active?: boolean;
}

interface ProjectItem {
  name: string;
  color: string;
  active?: boolean;
  icon?: boolean;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Inbox, label: "Inbox", badge: 5 },
  { icon: Users, label: "Teams" },
  { icon: UserCheck, label: "Assigned to me", active: true },
  { icon: UserPlus, label: "Created by me" },
];

const projects: ProjectItem[] = [
  { name: "Adrian Bert - CRM Da...", color: "bg-sidebar-foreground", active: true, icon: true },
  { name: "Trust - SaaS Dashbo...", color: "bg-success" },
  { name: "Pertamina Project", color: "bg-warning" },
  { name: "Garuda Project", color: "bg-brand" },
];

export function Sidebar() {
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-sidebar-border bg-sidebar">
      {/* Workspace Selector */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-light shadow-sm">
          <span className="text-sm font-bold text-white">K</span>
        </div>
        <div className="flex flex-1 items-center gap-1">
          <span className="text-sm font-semibold text-sidebar-foreground">
            Keitoto Studio
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-0.5 px-2.5">
        {mainNavItems.map((item) => (
          <Tooltip key={item.label} delayDuration={400}>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-all duration-200",
                  item.active
                    ? "bg-sidebar-accent text-sidebar-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    item.active
                      ? "text-sidebar-foreground"
                      : "text-muted-foreground group-hover:text-sidebar-foreground/80"
                  )}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-5 justify-center rounded-full bg-brand/10 px-1.5 text-[11px] font-semibold text-brand"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {item.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>

      <Separator className="mx-4 my-3 w-auto" />

      {/* Favorites Section */}
      <div className="px-2.5">
        <button
          onClick={() => setFavoritesOpen(!favoritesOpen)}
          className="group flex w-full items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 transition-colors hover:text-muted-foreground"
        >
          <ChevronRight
            className={cn(
              "h-3 w-3 transition-transform duration-200",
              favoritesOpen && "rotate-90"
            )}
          />
          <span>Favorites</span>
          <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <MoreHorizontal className="h-3.5 w-3.5" />
            <Plus className="h-3.5 w-3.5" />
          </div>
        </button>
      </div>

      <Separator className="mx-4 my-3 w-auto" />

      {/* Projects Section */}
      <div className="flex-1 overflow-hidden px-2.5">
        <button
          onClick={() => setProjectsOpen(!projectsOpen)}
          className="group flex w-full items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 transition-colors hover:text-muted-foreground"
        >
          <ChevronRight
            className={cn(
              "h-3 w-3 transition-transform duration-200",
              projectsOpen && "rotate-90"
            )}
          />
          <span>Projects</span>
        </button>

        {projectsOpen && (
          <div className="mt-1 flex flex-col gap-0.5">
            {projects.map((project) => (
              <button
                key={project.name}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium transition-all duration-200",
                  project.active
                    ? "bg-sidebar-accent text-sidebar-foreground shadow-sm border border-sidebar-border/50"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <div
                  className={cn(
                    "h-3 w-3 shrink-0 rounded-[3px] border",
                    project.active
                      ? "border-sidebar-foreground/30 bg-sidebar-foreground/10 text-sidebar-foreground"
                      : ["bg-transparent border-transparent", project.color]
                  )}
                >
                  {project.icon && <ListTodo className="h-full w-full opacity-60" />}
                </div>
                <span className={cn("flex-1 truncate text-left", project.active && "font-semibold text-sidebar-foreground")}>
                  {project.name}
                </span>
              </button>
            ))}

            {/* Add New */}
            <button className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium text-muted-foreground/60 transition-all duration-200 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground">
              <Plus className="h-4 w-4" />
              <span>New</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="mt-auto border-t border-sidebar-border px-2.5 py-2">
        <div className="flex flex-col gap-0.5">
          <button className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Settings</span>
          </button>
          <button className="flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] font-medium text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <span>Help Center</span>
          </button>
        </div>

        <Separator className="my-2" />

        {/* User Profile */}
        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
          <Avatar className="h-7 w-7 ring-2 ring-brand/20">
            <AvatarFallback className="bg-gradient-to-br from-brand to-brand-light text-[10px] font-semibold text-white">
              DR
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col">
            <span className="text-[13px] font-medium leading-tight text-sidebar-foreground">
              Darlene Robertson
            </span>
            <span className="text-[11px] text-muted-foreground">
              darlene@gmail.com
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}
