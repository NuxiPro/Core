// biome-ignore-all lint/suspicious/noConsole: Social sign-in failures are reported only during development.
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
import { authClient } from "@/src/shared/lib/client";
import {
  type LoginFields,
  LoginSchema,
} from "@/src/shared/lib/schemas/auth-schemas";
import { requestMagicLink } from "../api/auth";
import { MagicLinkSent } from "./MagicLinkSent";

const SOCIAL_BUTTON =
  "w-full h-12 bg-card text-base text-card-foreground hover:bg-accent border border-border font-medium relative active:scale-[0.98] transition-[background-color,transform] duration-200 ease-out";

const INPUT =
  "h-12 text-base bg-surface-root border border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-transparent transition-[border-color,box-shadow] duration-200";

export default function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
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
    if (error && import.meta.env.DEV) {
      console.error(`Social sign-in failed: ${provider}`);
    }
  };

  const onSubmit = async (data: LoginFields) => {
    const { error } = await requestMagicLink(data.email);
    if (error) {
      if ("code" in error && error.code === "EMAIL_NOT_VERIFIED") {
        router.navigate({ to: "/verify-email", search: { email: data.email } });
        return;
      }
      setError("root", { message: t("errors.incorrectEmail") });
      return;
    }
    setShowSent(true);
  };

  return (
    <div className="dark relative h-full w-full bg-background font-sans text-foreground selection:bg-primary/30">
      {isSubmitting && (
        <div className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-border">
          <div className="auth-loading-bar h-full w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </div>
      )}

      <div className="flex items-center justify-center h-full px-4">
        <div className="w-full max-w-[400px] space-y-7">
          <BrandLogo className="justify-start [&>img]:size-12" />

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {t("auth.welcomeTo")} {t("brand.name")}
            </h1>
            <p className="text-base text-muted-foreground">
              {t("auth.logInOrCreateHint")}
            </p>
          </div>

          <div className="space-y-4">
            {showSent ? (
              <MagicLinkSent />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <RateLimitBanner />
                <label
                  htmlFor="email"
                  className="block text-base font-medium text-foreground"
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
                  <p className="text-sm font-medium text-destructive">
                    {errors.email.message}
                  </p>
                )}
                {errors.root && (
                  <p className="text-sm font-medium text-destructive text-center">
                    {errors.root.message}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary text-base text-primary-foreground hover:bg-primary-hover border-0 font-medium relative active:scale-[0.98] transition-[background-color,transform] duration-200 ease-out"
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
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">
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
            <p className="text-base text-muted-foreground">
              {t("auth.magicLinkHint")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
