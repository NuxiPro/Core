import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { signUp } from "@/src/features/auth/api/auth";
import { MagicLinkSent } from "@/src/features/auth/components/MagicLinkSent";
import { RoutePending } from "@/src/layout/components/RoutePending";
import { BrandLogo } from "@/src/layout/components/ui/BrandLogo";
import {
  GitHubIcon,
  GoogleIcon,
  SpinnerIcon,
} from "@/src/layout/components/ui/auth-icons";
import { Button } from "@/src/layout/components/ui/button";
import { Input } from "@/src/layout/components/ui/input";
import { createLogger } from "@/src/shared/api/logger";
import { resolveSession } from "@/src/shared/lib/auth-guard";
import { authClient } from "@/src/shared/lib/client";
import {
  type RegisterFields,
  RegisterSchema,
} from "@/src/shared/lib/schemas/auth-schemas";

const log = createLogger("auth/register");

const INPUT =
  "h-11 bg-[#0f1011] border-0 text-[#f7f8f8] placeholder:text-[#8a8f98] focus-visible:ring-1 focus-visible:ring-[#5e6ad2]";

export const Route = createFileRoute("/_auth/register")({
  loader: async () => {
    const session = await resolveSession();
    if (session) throw redirect({ to: "/" });
    return null;
  },
  pendingComponent: RoutePending,
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const [sentEmail, setSentEmail] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({ resolver: zodResolver(RegisterSchema) });

  const handleSocial = async (provider: "google" | "github") => {
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: `${window.location.origin}/onboarding`,
    });
    if (error) log.error(`Erreur inscription ${provider}:`, error);
  };

  const onSubmit = async (data: RegisterFields) => {
    const { error } = await signUp(data.email);
    if (error) {
      log.error("Échec inscription email", error);
      setError("root", { message: t("errors.registrationError") });
      return;
    }
    setSentEmail(data.email);
  };

  return (
    <div className="relative h-full w-full bg-[#010102] font-sans selection:bg-[#5e6ad2]/20">
      {isSubmitting && (
        <div className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-[#23252a]">
          <div className="auth-loading-bar h-full w-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      )}

      <div className="flex items-center justify-center h-full px-4">
        <div className="w-full max-w-[340px] space-y-8">
          <BrandLogo />

          <h1 className="text-xl font-semibold text-white text-center">
            {t("auth.createYourAccount")}
          </h1>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 bg-white text-black hover:bg-zinc-200 border-0 font-medium"
              onClick={() => handleSocial("google")}
            >
              <GoogleIcon className="size-4" />
              {t("auth.continueWithGoogle")}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 bg-[#0f1011] text-[#f7f8f8] hover:bg-[#141516] border border-[#23252a] font-medium"
              onClick={() => handleSocial("github")}
            >
              <GitHubIcon className="size-4" />
              {t("auth.continueWithGitHub")}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#23252a]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#010102] px-2 text-[#62666d]">
                  {t("auth.or")}
                </span>
              </div>
            </div>

            {sentEmail ? (
              <MagicLinkSent email={sentEmail} />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  className={INPUT}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs font-medium text-red-400">
                    {errors.email.message}
                  </p>
                )}
                {errors.root && (
                  <p className="text-xs font-medium text-red-400 text-center">
                    {errors.root.message}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full h-11 bg-[#5e6ad2] text-white hover:bg-[#828fff] border-0 font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <SpinnerIcon
                        title={t("auth.creatingAccount")}
                        titleId="register-loading-title"
                      />
                      {t("auth.creatingAccount")}
                    </span>
                  ) : (
                    t("auth.signUpWithEmail")
                  )}
                </Button>
              </form>
            )}
          </div>

          <p className="text-sm text-[#8a8f98] text-center">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link
              to="/login"
              className="text-[#f7f8f8] hover:text-[#d0d6e0] transition-colors"
            >
              {t("auth.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
