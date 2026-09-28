export function priceUnitSuffix(unit: string | null | undefined, locale?: string): string {
  if (!unit) return "";
  if (unit === "bale") return locale === "lv" ? "/rullis" : "/bale";
  return `/${unit}`;
}

export function formatRelativeDays(dateString: string, locale: string): string {
  const days = Math.floor((Date.now() - new Date(dateString).getTime()) / 86_400_000);
  if (locale === "lv") {
    if (days <= 0) return "Šodien";
    if (days === 1) return "Vakar";
    return `Pirms ${days} dienām`;
  }
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
