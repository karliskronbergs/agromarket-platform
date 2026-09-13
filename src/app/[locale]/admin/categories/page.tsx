import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "./category-form";
import { DeleteCategoryButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name_lv, name_en, icon")
    .order("name_lv");

  return (
    <div className="flex flex-col gap-4">
      <CategoryForm locale={locale} />
      <div className="flex flex-col gap-2">
        {(categories ?? []).map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-lg border border-[#e7e2d8] bg-white p-3 text-sm"
          >
            <div>
              <span className="font-medium text-[#2b2a24]">{c.name_lv}</span>
              {" / "}
              {c.name_en} <span className="text-[#7a7566]">({c.slug})</span>
            </div>
            <DeleteCategoryButton locale={locale} categoryId={c.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
