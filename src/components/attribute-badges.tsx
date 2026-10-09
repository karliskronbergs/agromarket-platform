import { IconLeaf, IconMedal, IconGrain, IconWrench, IconStar } from "@/components/icons";

export type AttributeInfo = { icon: string; name_lv: string; name_en: string };

export const ATTRIBUTE_ICONS: Record<string, (props: { className?: string }) => React.ReactElement> = {
  leaf: IconLeaf,
  medal: IconMedal,
  grain: IconGrain,
  wrench: IconWrench,
  star: IconStar,
};

// README "Badges": green tint is for certification-type badges (e.g.
// bioloģiskā); everything else gets the neutral surface style.
const CERTIFICATION_ICONS = new Set(["leaf", "medal", "grain"]);

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
        const isCertification = CERTIFICATION_ICONS.has(a.icon);
        return (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-xs font-medium"
            style={
              isCertification
                ? { background: "#eef3ee", color: "#2f5538" }
                : { background: "#f0f2f0", color: "#1d2329" }
            }
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
  max = 2,
}: {
  attributes: AttributeInfo[];
  locale: string;
  max?: number;
}) {
  if (attributes.length === 0) return null;

  const shown = attributes.slice(0, max);
  const hidden = attributes.slice(max);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((a, i) => {
        const Icon = ATTRIBUTE_ICONS[a.icon] ?? IconStar;
        return (
          <span
            key={i}
            title={locale === "lv" ? a.name_lv : a.name_en}
            aria-label={locale === "lv" ? a.name_lv : a.name_en}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#eef3ee] text-[#2f5538]"
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        );
      })}
      {hidden.length > 0 && (
        <span
          title={hidden.map((a) => (locale === "lv" ? a.name_lv : a.name_en)).join(", ")}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#f0f2f0] text-[10px] font-semibold text-[#5d6670]"
        >
          +{hidden.length}
        </span>
      )}
    </div>
  );
}
