import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["lv", "en"],
  defaultLocale: "lv",
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
