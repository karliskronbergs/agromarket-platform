import { type CategoryRow, getSelfAndDescendantIds } from "@/lib/categories";

export type AnimalGroup = "sheep" | "beef-cattle" | "dairy-cattle";

export const DZIVNIEKI_ROOT_SLUG = "majlopi";

// Direct children of the Dzīvnieki root -- each one is a distinct breed group.
const BRANCH_SLUG_TO_GROUP: Record<string, AnimalGroup> = {
  aitas: "sheep",
  "galas-liellopi": "beef-cattle",
  "piena-liellopi": "dairy-cattle",
};

export const OTHER_BREED_VALUE = "other";

export type BreedOption = { value: string; name_lv: string; name_en: string };

const OTHER_BREED: BreedOption = {
  value: OTHER_BREED_VALUE,
  name_lv: "Krustojuma dzīvnieki un citas šķirnes",
  name_en: "Crossbred animals and other breeds",
};

export const BREED_OPTIONS: Record<AnimalGroup, BreedOption[]> = {
  sheep: [
    { value: "latvijas-tumsgalve", name_lv: "Latvijas tumšgalve", name_en: "Latvian Dark-headed" },
    { value: "ile-de-france", name_lv: "Ile de France", name_en: "Ile de France" },
    { value: "vacijas-merino", name_lv: "Vācijas merino", name_en: "German Merino" },
    { value: "oksfordauna", name_lv: "Oksfordauna", name_en: "Oxford Down" },
    { value: "romanova", name_lv: "Romanova", name_en: "Romanov" },
    { value: "teksela", name_lv: "Tekseļa", name_en: "Texel" },
    { value: "sufolka", name_lv: "Sufolka", name_en: "Suffolk" },
    { value: "dorpera", name_lv: "Dorpera", name_en: "Dorper" },
    { value: "sarole-aitas", name_lv: "Šarolē", name_en: "Charollais" },
    OTHER_BREED,
  ],
  "beef-cattle": [
    { value: "sarole", name_lv: "Šarolē", name_en: "Charolais" },
    { value: "hereforda", name_lv: "Herefordas", name_en: "Hereford" },
    { value: "limuzina", name_lv: "Limuzīna", name_en: "Limousin" },
    { value: "aberdinangus", name_lv: "Aberdīnangus", name_en: "Aberdeen Angus" },
    { value: "galoveja", name_lv: "Galovejas", name_en: "Galloway" },
    { value: "simentale", name_lv: "Simentāle", name_en: "Simmental" },
    OTHER_BREED,
  ],
  "dairy-cattle": [
    { value: "holsteina", name_lv: "Holšteinas", name_en: "Holstein" },
    { value: "latvijas-bruna", name_lv: "Latvijas brūnā", name_en: "Latvian Brown" },
    { value: "latvijas-zila", name_lv: "Latvijas zilā", name_en: "Latvian Blue" },
    { value: "simentale", name_lv: "Simentāle", name_en: "Simmental" },
    OTHER_BREED,
  ],
};

export function getAnimalGroupForCategory(
  categories: CategoryRow[],
  categoryId?: string | null,
): AnimalGroup | null {
  if (!categoryId) return null;
  const byId = new Map(categories.map((c) => [c.id, c]));
  let current = byId.get(categoryId);
  while (current) {
    if (current.slug && BRANCH_SLUG_TO_GROUP[current.slug]) {
      return BRANCH_SLUG_TO_GROUP[current.slug];
    }
    current = current.parent_id ? byId.get(current.parent_id) : undefined;
  }
  return null;
}

export function getLivestockCategoryIds(categories: CategoryRow[]): Set<string> {
  const root = categories.find((c) => c.slug === DZIVNIEKI_ROOT_SLUG);
  return root ? new Set(getSelfAndDescendantIds(categories, root.id)) : new Set<string>();
}

export function breedLabel(group: AnimalGroup, value: string, locale: string): string {
  const option = BREED_OPTIONS[group].find((o) => o.value === value);
  if (!option) return value;
  return locale === "lv" ? option.name_lv : option.name_en;
}
