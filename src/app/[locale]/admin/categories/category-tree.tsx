"use client";

import { buildCategoryTree, type CategoryNode, type CategoryRow } from "@/lib/categories";
import { DeleteCategoryButton } from "./delete-button";

type AdminCategory = CategoryRow & { slug: string };

function Row({ node, locale }: { node: CategoryNode<AdminCategory>; locale: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#e7e2d8] bg-white p-3 text-sm">
      <div>
        <span className="font-medium text-[#2b2a24]">{node.name_lv}</span>
        {" / "}
        {node.name_en} <span className="text-[#7a7566]">({node.slug})</span>
      </div>
      <span onClick={(e) => e.stopPropagation()}>
        <DeleteCategoryButton locale={locale} categoryId={node.id} />
      </span>
    </div>
  );
}

function CategoryNodeItem({ node, locale }: { node: CategoryNode<AdminCategory>; locale: string }) {
  if (node.children.length === 0) {
    return <Row node={node} locale={locale} />;
  }

  return (
    <details className="rounded-lg border border-[#e7e2d8] bg-[#faf8f3]">
      <summary className="cursor-pointer select-none p-2">
        <Row node={node} locale={locale} />
      </summary>
      <div className="flex flex-col gap-2 border-t border-[#e7e2d8] p-3">
        {node.children.map((child) => (
          <CategoryNodeItem key={child.id} node={child} locale={locale} />
        ))}
      </div>
    </details>
  );
}

export function CategoryTree({ categories, locale }: { categories: AdminCategory[]; locale: string }) {
  const tree = buildCategoryTree(categories);

  return (
    <div className="flex flex-col gap-2">
      {tree.map((root) => (
        <CategoryNodeItem key={root.id} node={root} locale={locale} />
      ))}
    </div>
  );
}
