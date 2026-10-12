import { Link } from "@tanstack/react-router";
import { CircleIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/layout/components/ui/sidebar";
import { slugify } from "@/src/shared/utils/utils";
type Project = {
  id: string;
  name: string;
  prefix: string;
  slug?: string;
};

export function NavProjects({
  projects,
  isLoading,
  activeProjectId,
}: {
  projects?: Project[];
  isLoading?: boolean;
  activeProjectId?: string;
}) {
  const { t } = useTranslation();
  const items = projects ?? [];

  // Simple color generator based on project ID
  const getProjectColor = (id: string) => {
    const colors = [
      "text-rose-500",
      "text-amber-500",
      "text-emerald-500",
      "text-sky-500",
      "text-violet-500",
      "text-pink-500",
    ];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <SidebarGroup className="p-0">
      <SidebarMenu>
        {isLoading && items.length === 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton
              disabled
              className="text-muted-foreground opacity-40"
            >
              <span className="text-[11px]">{t("common.loading")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        {!isLoading && items.length === 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton
              disabled
              className="text-muted-foreground opacity-40"
            >
              <span className="text-[11px]">{t("sidebar.noProjects")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        {items.map((item) => {
          const isActive = item.id === activeProjectId;
          const colorClass = getProjectColor(item.id);

          return (
            <SidebarMenuItem key={item.id} className="my-1">
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className={`group/item relative rounded-md transition-all duration-200 border ${
                  isActive
                    ? "border-black/15 dark:border-border bg-secondary shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]"
                    : "border-transparent hover:border-black/8 dark:hover:border-border hover:bg-sidebar-accent"
                }`}
              >
                <Link
                  to="/kanban/$projectSlug"
                  params={{ projectSlug: item.slug ?? slugify(item.name) }}
                  className="px-2.5 py-2"
                >
                  {isActive ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ring-2 ring-emerald-500/30" />
                  ) : (
                    <CircleIcon
                      className={`size-2.5 ${colorClass} group-hover/item:opacity-100 opacity-80 transition-opacity duration-200`}
                    />
                  )}
                  <span className="text-[13px] text-sidebar-foreground truncate">
                    {item.name}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
