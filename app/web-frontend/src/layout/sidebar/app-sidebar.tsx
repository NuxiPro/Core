import { useLocation } from "@tanstack/react-router";
import { BuildingIcon, Check, ChevronDown } from "lucide-react";
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

  // Extraire le slug depuis l'URL : /kanban/marketing-q3-a671
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
        {/* Section 1: Workspace Selector */}
        <SidebarHeader className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 p-2 border border-black/10 dark:border-border rounded-md cursor-pointer hover:bg-sidebar-accent transition-colors bg-black/[0.04]">
                <BuildingIcon className="size-4 text-sidebar-foreground" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[13px] font-medium text-sidebar-foreground truncate">
                    {currentWorkspace?.name ?? t("sidebar.noWorkspace")}
                  </span>
                </div>
                <ChevronDown className="size-3.5 text-sidebar-foreground flex-shrink-0" />
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
        {/* Section 2: First Separator */}{" "}
        {/* Veuillez ne pas touchée cette section car il est utile pour plus tard */}
        {/*<div className="px-3 py-2">
          <div className="h-px bg-border/30" />
        </div>*/}
        {/* Section 3: General Views (Placeholder) */}
        {/*<div className="px-3 mb-2">
          <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-2 ml-2.5">
            {t("sidebar.views")}
          </div>
          <div className="text-[11px] text-muted-foreground italic">
             // Will be implemented later
          </div>
        </div>*/}
        {/* Section 4: Second Separator */}
        <div className="px-3 py-2">
          <div className="h-px bg-border/30" />
        </div>
        {/* Section 5: Projects List */}
        <div className="px-3 mb-2">
          <div className="flex items-center justify-between mb-2 px-2.5">
            <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {t("sidebar.projects")}
            </div>
            <NewProjectDialog
              trigger={
                <button
                  type="button"
                  className="p-0.5 rounded hover:bg-sidebar-accent transition-colors"
                  aria-label={t("sidebar.newProject")}
                >
                  <svg
                    className="size-3.5 text-muted-foreground hover:text-sidebar-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v14m7-7H5"
                    />
                  </svg>
                </button>
              }
            />
          </div>
          <NavProjects
            projects={projects}
            isLoading={isLoading}
            activeProjectId={activeProjectId}
          />
        </div>
        {/* Section 6: Third Separator */}
        <div className="mt-auto px-3 py-2">
          <div className="h-px bg-border/30" />
        </div>
        {/* Section 7: User Menu */}
        <div className="p-3">
          <NavUser user={userData} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
