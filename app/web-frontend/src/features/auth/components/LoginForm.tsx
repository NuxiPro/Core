import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { RateLimitBanner } from "@/src/layout/components/animation/rate-limit-banner";
import { GitHubIcon, GoogleIcon } from "@/src/layout/components/ui/auth-icons";
import { BrandLogo } from "@/src/layout/components/ui/BrandLogo";
import { Button } from "@/src/layout/components/ui/button";
import { Input } from "@/src/layout/components/ui/input";
import { LastUsedBadge } from "@/src/layout/components/ui/last-used-badge";
import { createLogger } from "@/src/shared/api/logger";
import { authClient } from "@/src/shared/lib/client";
import {
  type LoginFields,
  LoginSchema,
} from "@/src/shared/lib/schemas/auth-schemas";
import { requestMagicLink } from "../api/auth";
import { MagicLinkSent } from "./MagicLinkSent";

const log = createLogger("auth/login");

const SOCIAL_BUTTON =
  "w-full h-12 bg-[#0f1011] text-base text-[#f7f8f8] hover:bg-[#141516] border border-[#23252a] font-medium relative active:scale-[0.98] transition-[background-color,transform] duration-200 ease-out";

const INPUT =
  "h-12 text-base bg-[#0f1011] border border-[#23252a] text-[#f7f8f8] placeholder:text-[#8a8f98] focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:border-transparent transition-[border-color,box-shadow] duration-200";

export default function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [showSent, setShowSent] = useState(false);
  // Last used entry method (google, github, email) or null on first visit.
  const [lastUsed] = useState(() => authClient.getLastUsedLoginMethod());
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({ resolver: zodResolver(LoginSchema) });

  const handleSocial = async (provider: "google" | "github") => {
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: `${window.location.origin}/onboarding`,
    });
    if (error) log.error(`Erreur connexion ${provider}:`, error);
  };

  const onSubmit = async (data: LoginFields) => {
    // Minimum sending beat (~700ms) so the action feels done, not skipped.
    const startedAt = Date.now();
    const { error } = await requestMagicLink(data.email);
    const elapsed = Date.now() - startedAt;
    if (elapsed < 700) {
      await new Promise((resolve) => setTimeout(resolve, 700 - elapsed));
    }
    if (error) {
      if ("code" in error && error.code === "EMAIL_NOT_VERIFIED") {
        router.navigate({ to: "/verify-email", search: { email: data.email } });
        return;
      }
      log.error("Email connection failed", error);
      setError("root", { message: t("errors.incorrectEmail") });
      return;
    }
    setSent(true);
    // Let the form implode before swapping in the success state.
    setTimeout(() => setShowSent(true), 450);
  };

  return (
    <div className="relative h-full w-full bg-[#010102] font-sans selection:bg-primary/30">
      {isSubmitting && (
        <div className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-[#23252a]">
          <div className="auth-loading-bar h-full w-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      )}

      <div className="flex items-center justify-center h-full px-4">
        <div className="w-full max-w-[400px] space-y-7">
          <BrandLogo className="justify-start [&>img]:size-12" />

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {t("auth.welcomeTo")} {t("brand.name")}
            </h1>
            <p className="text-base text-[#8a8f98]">
              {t("auth.logInOrCreateHint")}
            </p>
          </div>

          <div className="space-y-4">
            {showSent ? (
              <MagicLinkSent />
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className={`space-y-4 origin-center transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${sent ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
              >
                <RateLimitBanner />
                <label
                  htmlFor="email"
                  className="block text-base font-medium text-[#f7f8f8]"
                >
                  {t("auth.emailAddress")}
                </label>
                <Input
                  id="email"
                  type="email"
                  autoFocus
                  placeholder={t("auth.emailPlaceholder")}
                  className={INPUT}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm font-medium text-red-400">
                    {errors.email.message}
                  </p>
                )}
                {errors.root && (
                  <p className="text-sm font-medium text-red-400 text-center">
                    {errors.root.message}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full h-12 bg-white text-base text-black hover:bg-zinc-200 border-0 font-medium relative active:scale-[0.98] transition-[background-color,transform] duration-200 ease-out"
                  disabled={isSubmitting}
                >
                  {t("auth.continueWithEmail")}
                  {lastUsed &&
                    lastUsed !== "google" &&
                    lastUsed !== "github" && (
                      <LastUsedBadge label={t("auth.lastUsed")} />
                    )}
                </Button>
              </form>
            )}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#23252a]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#010102] px-2 text-[#8a8f98]">
                  {t("auth.or")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className={SOCIAL_BUTTON}
                onClick={() => handleSocial("google")}
              >
                <GoogleIcon className="size-4" />
                Google
                {lastUsed === "google" && (
                  <LastUsedBadge label={t("auth.lastUsed")} />
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className={SOCIAL_BUTTON}
                onClick={() => handleSocial("github")}
              >
                <GitHubIcon className="size-4" />
                GitHub
                {lastUsed === "github" && (
                  <LastUsedBadge label={t("auth.lastUsed")} />
                )}
              </Button>
            </div>
          </div>

          {!showSent && (
            <p className="text-base text-[#8a8f98]">
              {t("auth.magicLinkHint")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
