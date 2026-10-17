import { useLocation } from "@tanstack/react-router";
import { BuildingIcon, Check, ChevronDown, Plus } from "lucide-react";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { useProjects } from "@/src/features/board/hooks/useProjects";
import { useWorkspaces } from "@/src/features/board/hooks/useWorkspaces";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/layout/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/src/layout/components/ui/sidebar";
import { useAuth } from "@/src/shared/hooks/useAuth";
import { findProjectBySlug } from "@/src/shared/utils/utils";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { NewProjectDialog } from "./new-project-dialog";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { projects, isLoading } = useProjects();
  const { workspaces } = useWorkspaces();
  const location = useLocation();

  // Slug depuis l'URL : /kanban/marketing-q3-a671
  const slugMatch = location.pathname.match(/\/kanban\/([^/]+)/);
  const slug = slugMatch?.[1] ?? "";
  const matchedProject = findProjectBySlug(projects, slug);
  const activeProjectId = matchedProject?.id;

  const currentWorkspace = workspaces[0];

  const userData = user || {
    name: t("sidebar.defaultUserName"),
    email: t("sidebar.defaultUserEmail"),
    avatar: "",
  };

  return (
    <Sidebar variant="inset" className="z-1" {...props}>
      <SidebarContent className="bg-sidebar">
        {/* ZONE HAUTE — sélecteur workspace, hauteur fixe */}
        <SidebarHeader className="shrink-0 p-3 pb-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors hover:bg-sidebar-accent">
                <BuildingIcon className="size-4 shrink-0 text-sidebar-foreground" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-sidebar-foreground">
                  {currentWorkspace?.name ?? t("sidebar.noWorkspace")}
                </span>
                <ChevronDown className="size-3.5 shrink-0 text-sidebar-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={4} className="w-56">
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  className="flex items-center gap-2"
                >
                  <BuildingIcon className="size-3.5 text-muted-foreground" />
                  <span className="flex-1 truncate">{workspace.name}</span>
                  {workspace.id === currentWorkspace?.id && (
                    <Check className="size-3.5 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>

        {/* ZONE CENTRALE — scroll interne, ne pousse jamais le footer */}
        <div className="px-5 pt-2.5" aria-hidden>
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-3 pt-3">
          <div className="flex shrink-0 items-center justify-between px-2.5 pb-1">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {t("sidebar.projects")}
            </span>
            <NewProjectDialog
              trigger={
                <button
                  type="button"
                  className="rounded p-0.5 cursor-pointer transition-colors hover:bg-sidebar-accent"
                  aria-label={t("sidebar.newProject")}
                >
                  <Plus
                    className="size-3.5 text-muted-foreground hover:text-sidebar-foreground"
                    aria-hidden
                  />
                </button>
              }
            />
          </div>
          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pb-2">
            <NavProjects
              projects={projects}
              isLoading={isLoading}
              activeProjectId={activeProjectId}
            />
          </div>
        </div>

        {/* ZONE BASSE — profil, toujours visible */}
        <div className="mt-auto shrink-0 px-5 pt-2.5" aria-hidden>
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <div className="p-3">
          <NavUser user={userData} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
