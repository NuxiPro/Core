import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/src/layout/components/ui/BrandLogo";
import { Button } from "@/src/layout/components/ui/button";

export const Route = createFileRoute("/_auth/link-expired")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  useEffect(() => {
    window.dispatchEvent(new Event("app-ready"));
  }, []);

  return (
    <div className="dark relative h-full w-full bg-background text-foreground font-sans">
      <div className="flex items-center justify-center h-full px-4">
        <div className="w-full max-w-[340px] space-y-6 text-center">
          <BrandLogo />
          <div className="mx-auto size-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-xl text-destructive">!</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("auth.linkExpiredTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("auth.linkExpiredHint")}
          </p>
          <Button
            type="button"
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary-hover border-0 font-medium transition-all duration-[420ms] ease-out"
            asChild
          >
            <Link to="/login">{t("auth.sendNewLink")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
