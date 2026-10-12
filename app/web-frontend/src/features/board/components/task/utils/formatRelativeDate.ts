import i18n from "@/src/features/i18n";

export const formatRelativeDate = (date?: string): string => {
  if (!date?.trim()) return "";
  const d = new Date(date.endsWith("Z") ? date : `${date}Z`);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60)
    return i18n.language?.startsWith("fr") ? "à l'instant" : "just now";
  const min = Math.floor(sec / 60);
  if (min < 60)
    return new Intl.RelativeTimeFormat(i18n.language || "en", {
      numeric: "auto",
    }).format(-min, "minute");
  const hr = Math.floor(min / 60);
  if (hr < 24)
    return new Intl.RelativeTimeFormat(i18n.language || "en", {
      numeric: "auto",
    }).format(-hr, "hour");
  const days = Math.floor(hr / 24);
  if (days < 7)
    return new Intl.RelativeTimeFormat(i18n.language || "en", {
      numeric: "auto",
    }).format(-days, "day");
  return d.toLocaleDateString(i18n.language || "en");
};
