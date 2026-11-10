import { useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  CreditCard,
  LogOut,
  Monitor,
  Moon,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/src/features/i18n";
import { signOut } from "@/src/features/auth/api/auth";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/layout/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/layout/components/ui/dropdown-menu";
import { useSidebar } from "@/src/layout/components/ui/sidebar";
import { useTheme } from "@/src/shared/hooks/useTheme";
import { waitForSession } from "@/src/shared/lib/auth-guard";

const SettingsDialog = lazy(() =>
  import("@/src/features/settings").then((m) => ({
    default: m.SettingsDialog,
  })),
);

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { isDark, setTheme, theme } = useTheme();
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  const nextTheme = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
  const ThemeIcon = theme === "system" ? Monitor : isDark ? Sun : Moon;

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) return;
    await waitForSession((session) => !session);
    navigate({ to: "/login" });
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center gap-3 p-2.5 border border-black/10 dark:border-border rounded-md cursor-pointer group hover:bg-sidebar-accent hover:shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] dark:hover:shadow-none bg-black/[0.04] transition-[transform,background-color,box-shadow] duration-100 ease-out active:scale-[0.97] motion-reduce:active:scale-100 motion-reduce:transition-none"
          >
            <div className="relative shrink-0">
              <Avatar className="h-9 w-9 rounded-full">
                <AvatarImage src={user.avatar} alt={user.name ?? user.email ?? ""} />
                <AvatarFallback className="rounded-full bg-secondary">
                  <User className="size-4 text-sidebar-foreground" />
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar" />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
              <span className="text-[13px] font-semibold leading-tight text-sidebar-foreground truncate block w-full">
                {user.name?.trim() ? user.name.trim() : user.email}
              </span>
            </div>
            {/* Chevron droit/gauche — rotation douce type "spring" Apple */}
            <svg
              className={`size-4 text-muted-foreground shrink-0 will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 ${menuOpen ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <title>{menuOpen ? "Fermer" : "Ouvrir"}</title>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border-border/80 bg-sidebar"
          side={isMobile ? "bottom" : "right"}
          align="start"
          sideOffset={6}
        >
          <div className="flex items-center gap-3 px-3 py-2.5">
            <Avatar className="h-10 w-10 rounded-full shrink-0">
              <AvatarImage src={user.avatar} alt={user.name ?? user.email ?? ""} />
              <AvatarFallback className="rounded-full bg-secondary">
                <User className="size-4 text-sidebar-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {user.name?.trim() ? user.name.trim() : user.email}
              </p>
              {user.name?.trim() ? (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {user.email}
                </p>
              ) : null}
            </div>
          </div>
          <DropdownMenuSeparator className="bg-border/40" />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => setTheme(nextTheme)}
              className="text-sidebar-foreground"
            >
              <ThemeIcon className="mr-2.5 h-4 w-4" />
              {t("settings.general.theme")}: {t(`settings.general.${theme}`)}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-border/40" />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => setAccountOpen(true)}
              className="text-sidebar-foreground"
            >
              <BadgeCheck className="mr-2.5 h-4 w-4" />
              {t("sidebar.settings")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-border/40" />
          <DropdownMenuGroup>
            <DropdownMenuItem className="text-sidebar-foreground">
              <Sparkles className="mr-2.5 h-4 w-4" />
              {t("sidebar.upgradeToPro")}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-sidebar-foreground">
              <CreditCard className="mr-2.5 h-4 w-4" />
              {t("sidebar.billing")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-border/40" />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-muted-foreground"
          >
            <LogOut className="mr-2.5 h-4 w-4" />
            {t("sidebar.logOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Suspense>
        <SettingsDialog open={accountOpen} onOpenChange={setAccountOpen} />
      </Suspense>
    </>
  );
}
