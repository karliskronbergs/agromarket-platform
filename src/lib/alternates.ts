import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lauks24.lv";

// pathAndQuery is the part after the locale segment, e.g. "" for the home
// page, "/listings/abc123", or "/map?mode=sell&category=xyz". Every locale
// in routing.locales shares the same path shape (no localized pathnames),
// so swapping the locale segment is all that's needed.
export function buildLanguageAlternates(pathAndQuery: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${SITE_URL}/${locale}${pathAndQuery}`;
  }
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${pathAndQuery}`;
  return languages;
}
