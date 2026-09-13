"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type CategoryState = { error: string | null };

const categorySchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers, and hyphens only."),
  nameLv: z.string().min(2).max(80),
  nameEn: z.string().min(2).max(80),
  icon: z.string().max(60).optional(),
});

export async function addCategory(
  locale: string,
  _prevState: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  const parsed = categorySchema.safeParse({
    slug: formData.get("slug"),
    nameLv: formData.get("nameLv"),
    nameEn: formData.get("nameEn"),
    icon: formData.get("icon") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: category, error } = await supabase
    .from("categories")
    .insert({
      slug: parsed.data.slug,
      name_lv: parsed.data.nameLv,
      name_en: parsed.data.nameEn,
      icon: parsed.data.icon ?? null,
    })
    .select("id")
    .single();

  if (error || !category) {
    return { error: error?.message ?? "Could not create category." };
  }

  await supabase.from("admin_audit_log").insert({
    admin_id: user!.id,
    action: "category_created",
    target_type: "category",
    target_id: category.id,
  });

  revalidatePath(`/${locale}/admin/categories`);
  return { error: null };
}

export async function deleteCategory(locale: string, categoryId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("categories").delete().eq("id", categoryId);

  await supabase.from("admin_audit_log").insert({
    admin_id: user!.id,
    action: "category_deleted",
    target_type: "category",
    target_id: categoryId,
  });

  revalidatePath(`/${locale}/admin/categories`);
}
