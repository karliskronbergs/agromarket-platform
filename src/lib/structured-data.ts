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

type ProfileForLocalBusiness = {
  slug: string;
  business_name: string;
  description: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  avatar_url: string | null;
  cover_url: string | null;
};

// Phone/email are deliberately left out: the UI gates them behind login
// (ContactsCard) as a signup incentive, and JSON-LD lives in the raw server
// HTML, so including them here would bypass that gate for anyone reading
// page source. Address is already shown publicly in the page header, so
// it carries no equivalent tradeoff.
export function buildProfileLocalBusinessJsonLd({
  profile,
  categoryName,
  locale,
}: {
  profile: ProfileForLocalBusiness;
  categoryName: string | null;
  locale: string;
}): Record<string, unknown> {
  const images = [profile.avatar_url, profile.cover_url].filter((u): u is string => !!u);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: profile.business_name,
    url: `${SITE_URL}/${locale}/profiles/${profile.slug}`,
    ...(profile.description ? { description: profile.description } : {}),
    ...(images.length > 0 ? { image: images } : {}),
    ...(profile.address ? { address: profile.address } : {}),
    ...(profile.lat != null && profile.lng != null
      ? { geo: { "@type": "GeoCoordinates", latitude: profile.lat, longitude: profile.lng } }
      : {}),
    ...(categoryName ? { knowsAbout: categoryName } : {}),
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
