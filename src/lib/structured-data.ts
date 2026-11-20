const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lauks24.lv";

type ListingForJsonLd = {
  id: string;
  listing_type: string;
  title: string;
  description: string | null;
  price: number | null;
  availability: string | null;
  condition: string | null;
};

type ProfileForJsonLd = { business_name: string; slug: string } | null;

// Only "sell" listings are real products -- marking up "buy" (wanted) posts
// as schema.org Product/Offer would be semantically wrong and risks Google
// treating the markup as mismatched/spammy.
export function buildListingProductJsonLd({
  listing,
  profile,
  images,
  locale,
}: {
  listing: ListingForJsonLd;
  profile: ProfileForJsonLd;
  images: string[];
  locale: string;
}): Record<string, unknown> | null {
  if (listing.listing_type !== "sell" || listing.price == null) return null;

  const availability =
    listing.availability === "reservation" ? "https://schema.org/PreOrder" : "https://schema.org/InStock";

  const itemCondition =
    listing.condition === "new"
      ? "https://schema.org/NewCondition"
      : listing.condition === "used"
        ? "https://schema.org/UsedCondition"
        : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    ...(listing.description ? { description: listing.description } : {}),
    ...(images.length > 0 ? { image: images } : {}),
    ...(itemCondition ? { itemCondition } : {}),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "EUR",
      availability,
      url: `${SITE_URL}/${locale}/listings/${listing.id}`,
      ...(profile
        ? {
            seller: {
              "@type": "Organization",
              name: profile.business_name,
              url: `${SITE_URL}/${locale}/profiles/${profile.slug}`,
            },
          }
        : {}),
    },
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
