import { useTranslation } from "react-i18next";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/layout/components/ui/avatar";
import { Badge } from "@/src/layout/components/ui/badge";
import { Button } from "@/src/layout/components/ui/button";
import { Input } from "@/src/layout/components/ui/input";
import { Separator } from "@/src/layout/components/ui/separator";

interface ProfileTabProps {
  user: { name: string; email: string; avatar: string } | null;
  isOAuth: boolean;
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function ProfileTab({
  user,
  isOAuth,
  name,
  setName,
  email,
  setEmail,
  isSaving,
  onSave,
}: ProfileTabProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar size="lg" className="rounded-full">
          <AvatarImage
            src={user?.avatar}
            alt={user?.name}
            className="rounded-full"
          />
          <AvatarFallback className="rounded-full bg-muted text-lg font-medium">
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-base font-medium text-foreground">
            {user?.name || t("settings.profile.user")}
          </p>
          <p className="text-sm text-muted-foreground">
            {user?.email || "email@example.com"}
          </p>
          <div className="mt-1.5">
            <Badge variant="secondary" className="text-[10px]">
              {isOAuth ? "OAuth" : "Email"}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {t("settings.profile.personalInfo")}
          </h4>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="profile-name"
              className="text-sm font-medium text-foreground"
            >
              {t("settings.profile.name")}
            </label>
            <div className="w-64 shrink-0">
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="profile-email"
              className="text-sm font-medium text-foreground"
            >
              {t("settings.profile.email")}
            </label>
            <div className="w-64 shrink-0">
              <Input
                id="profile-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-end">
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? t("settings.saving") : t("settings.save")}
        </Button>
      </div>
    </div>
  );
}
