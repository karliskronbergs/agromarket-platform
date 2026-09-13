import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Home");
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name_lv, name_en")
    .order("name_lv")
    .limit(8);

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center gap-6 px-6 py-20 text-center">
        <h1 className="max-w-2xl font-sans text-3xl font-semibold tracking-tight text-[#2b2a24] sm:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg text-[#55503f]">{t("subtitle")}</p>
        <Link
          href="/map"
          className="rounded-full bg-[#3f6b3f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2f5233]"
        >
          {t("cta")}
        </Link>

        {categories && categories.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={{ pathname: "/map", query: { mode: "profiles", category: c.id } }}
                className="rounded-full border border-[#e7e2d8] bg-white px-3 py-1.5 text-sm font-medium text-[#55503f] hover:border-[#3f6b3f] hover:text-[#3f6b3f]"
              >
                {locale === "lv" ? c.name_lv : c.name_en}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 border-t border-[#e7e2d8] bg-white px-6 py-16 sm:grid-cols-3">
        <FeatureCard title={t("feature1Title")} body={t("feature1Body")} />
        <FeatureCard title={t("feature2Title")} body={t("feature2Body")} />
        <FeatureCard title={t("feature3Title")} body={t("feature3Body")} />
      </section>
    </main>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto flex max-w-xs flex-col gap-2 text-center">
      <h2 className="font-sans text-lg font-semibold text-[#2b2a24]">{title}</h2>
      <p className="text-sm text-[#55503f]">{body}</p>
    </div>
  );
}
