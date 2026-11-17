import { Link, useNavigate } from "@tanstack/react-router";
import { SettingsIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/layout/components/ui/sidebar";
import { slugify } from "@/src/shared/utils/utils";

// Précharge la page de settings (lazy) dès le survol du bouton,
// pour éviter un écran vide au premier clic.
const preloadProjectSettings = () => {
  void import("@/src/features/project-settings/ProjectSettingsPage");
};

type Project = {
  id: string;
  name: string;
  prefix: string;
  slug?: string;
};

export function NavProjects({
  projects,
  isLoading,
  isError,
  activeProjectId,
}: {
  projects?: Project[] | undefined;
  isLoading?: boolean | undefined;
  isError?: boolean | undefined;
  activeProjectId?: string | undefined;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

        {!isLoading && !isError && items.length === 0 && (
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
            <SidebarMenuItem
              key={item.id}
              className="group/menu-item relative my-0.5"
            >
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className="rounded-md pr-9 transition-colors duration-200 hover:bg-sidebar-accent/60 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium"
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
              <button
                type="button"
                aria-label={`${t("settings.projectSettings")}: ${item.name}`}
                onPointerEnter={preloadProjectSettings}
                onFocus={preloadProjectSettings}
                className="cursor-pointer absolute right-1.5 top-1/2 z-10 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-hover/menu-item:opacity-100"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  navigate({
                    to: "/kanban/$projectSlug/settings",
                    params: {
                      projectSlug: item.slug ?? slugify(item.name),
                    },
                  });
                }}
              >
                <SettingsIcon className="size-4" aria-hidden="true" />
              </button>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
