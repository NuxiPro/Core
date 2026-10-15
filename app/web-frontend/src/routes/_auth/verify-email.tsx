import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { MailIcon } from "@/src/layout/components/ui/auth-icons";
import { BrandLogo } from "@/src/layout/components/ui/BrandLogo";
import { CURRENT_YEAR } from "@/src/shared/lib/constants";

export const Route = createFileRoute("/_auth/verify-email")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const search = useSearch({ strict: false }) as { email?: string };
  const email = search?.email ?? "";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#010102] font-sans selection:bg-primary/30 px-4 overflow-y-auto">
      <div className="w-full max-w-sm space-y-8">
        {/* Brand + Icône */}
        <div className="text-center animate-fade-in-up space-y-4">
          <BrandLogo />
          <div className="mx-auto flex items-center justify-center size-16 rounded-2xl bg-[#0f1011] border border-[#23252a]">
            <MailIcon className="text-[#8a8f98]" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3 text-center animate-fade-in-up animate-delay-75">
          <h1 className="text-xl font-semibold text-[#f7f8f8]">
            {t("auth.verifyEmailTitle")}
          </h1>
          <p className="text-sm text-[#8a8f98] leading-relaxed">
            {t("auth.verifyEmailDescription")}
          </p>
          {email && (
            <p className="text-sm font-medium text-[#f7f8f8] bg-[#0f1011] border border-[#23252a] rounded-lg px-3 py-2 inline-block">
              {email}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-3 animate-fade-in-up animate-delay-150">
          <p className="text-xs text-[#8a8f98] text-center">
            {t("auth.verifyEmailCheckSpam")}
          </p>
        </div>

        {/* Liens */}
        <div className="space-y-3 text-center animate-fade-in-up animate-delay-200">
          <Link
            to="/login"
            className="text-sm text-[#f7f8f8] font-medium underline underline-offset-4 hover:text-[#d0d6e0] transition-colors duration-300"
          >
            {t("auth.verifyEmailGoToLogin")}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-xs text-[#62666d]">
        &copy; {CURRENT_YEAR} {t("brand.name")}. {t("brand.tagline")}
      </div>
    </div>
  );
}
