import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "./category-form";
import { CategoryTree } from "./category-tree";

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
    .select("id, slug, name_lv, name_en, icon, parent_id")
    .order("name_lv");

  return (
    <div className="flex flex-col gap-4">
      <CategoryForm locale={locale} categories={categories ?? []} />
      <CategoryTree categories={categories ?? []} locale={locale} />
    </div>
  );
}
