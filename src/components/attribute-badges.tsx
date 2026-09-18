import { IconLeaf, IconMedal, IconGrain, IconWrench, IconStar } from "@/components/icons";

export type AttributeInfo = { icon: string; name_lv: string; name_en: string };

export const ATTRIBUTE_ICONS: Record<string, (props: { className?: string }) => React.ReactElement> = {
  leaf: IconLeaf,
  medal: IconMedal,
  grain: IconGrain,
  wrench: IconWrench,
  star: IconStar,
};

export function AttributeBadges({
  attributes,
  locale,
}: {
  attributes: AttributeInfo[];
  locale: string;
}) {
  if (attributes.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {attributes.map((a, i) => {
        const Icon = ATTRIBUTE_ICONS[a.icon] ?? IconStar;
        return (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e7e2d8] bg-[#f1efe6] px-2.5 py-1 text-xs font-medium text-[#3f6b3f]"
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            {locale === "lv" ? a.name_lv : a.name_en}
          </span>
        );
      })}
    </div>
  );
}

export function AttributeIconRow({
  attributes,
  locale,
}: {
  attributes: AttributeInfo[];
  locale: string;
}) {
  if (attributes.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {attributes.map((a, i) => {
        const Icon = ATTRIBUTE_ICONS[a.icon] ?? IconStar;
        return (
          <span
            key={i}
            title={locale === "lv" ? a.name_lv : a.name_en}
            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#e7efe1] text-[#3f6b3f]"
          >
            <Icon className="h-3 w-3" />
          </span>
        );
      })}
    </div>
  );
}
