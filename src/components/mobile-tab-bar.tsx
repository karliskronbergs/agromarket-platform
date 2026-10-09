import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { MobileTabBarClient } from "@/components/mobile-tab-bar-client";

export async function MobileTabBar() {
  const t = await getTranslations("Nav");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const labels = {
    home: t("tabHome"),
    map: t("map"),
    listings: t("listings"),
    profile: t("tabProfile"),
    login: t("signIn"),
  };

  return (
    <Suspense fallback={null}>
      <MobileTabBarClient loggedIn={!!user} labels={labels} />
    </Suspense>
  );
}
