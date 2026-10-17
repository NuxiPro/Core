import { Link } from "@tanstack/react-router";
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
  projects?: Project[] | undefined;
  isLoading?: boolean | undefined;
  activeProjectId?: string | undefined;
}) {
  const { t } = useTranslation();
  const items = projects ?? [];

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

          return (
            <SidebarMenuItem key={item.id} className="my-0.5">
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className="rounded-md transition-colors duration-200 hover:bg-sidebar-accent/60 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium"
              >
                <Link
                  to="/kanban/$projectSlug"
                  params={{ projectSlug: item.slug ?? slugify(item.name) }}
                  preload="intent"
                  activeOptions={{ exact: false }}
                  activeProps={{ className: "bg-sidebar-accent font-medium" }}
                  aria-current={isActive ? "page" : undefined}
                  className="group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors hover:bg-sidebar-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span
                    aria-hidden
                    className={`size-2.5 shrink-0 rounded-full transition-colors group-data-[status=active]:bg-emerald-500 group-data-[status=active]:ring-2 group-data-[status=active]:ring-emerald-500/25 ${
                      isActive
                        ? "bg-emerald-500 ring-2 ring-emerald-500/25"
                        : "bg-muted-foreground/50"
                    }`}
                  />
                  <span className="truncate text-[13px] text-sidebar-foreground">
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
