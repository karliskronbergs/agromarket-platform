"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconCheck, IconShield, IconSearch, IconTrash } from "@/components/icons";
import { deleteProfileAsAdmin } from "./actions";

export type AdminProfileRow = {
  id: string;
  businessName: string;
  slug: string;
  address: string | null;
  status: "active" | "suspended";
  verified: boolean;
  adminBadge: boolean;
  viewCount: number;
  listingViewCount: number;
  listingsCount: number;
  createdAt: string;
  contactEmail: string | null;
  phone: string | null;
  categories: string[];
};

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCsv(rows: AdminProfileRow[]) {
  const headers = [
    "Business name",
    "Slug",
    "Address",
    "Status",
    "Verified",
    "Admin",
    "Categories",
    "Active listings",
    "Views",
    "Contact email",
    "Phone",
    "Created at",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.businessName,
        r.slug,
        r.address ?? "",
        r.status,
        r.verified ? "yes" : "no",
        r.adminBadge ? "yes" : "no",
        r.categories.join("; "),
        r.listingsCount,
        r.viewCount + r.listingViewCount,
        r.contactEmail ?? "",
        r.phone ?? "",
        r.createdAt,
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `agromarket-profiles-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ProfilesTable({ locale, profiles }: { locale: string; profiles: AdminProfileRow[] }) {
  const t = useTranslations("Admin");
  const tProfile = useTranslations("Profile");
  const tDashboard = useTranslations("Dashboard");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) =>
      [p.businessName, p.address ?? "", ...p.categories].some((field) =>
        field.toLowerCase().includes(q),
      ),
    );
  }, [profiles, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-[#7a7566]">
          {t("totalLabel")}: <span className="font-semibold text-[#2b2a24]">{profiles.length}</span>
          {query && (
            <>
              {" "}
              &middot; {t("shownLabel")}: <span className="font-semibold text-[#2b2a24]">{filtered.length}</span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => downloadCsv(filtered)}
          className="rounded-full border border-[#3f6b3f] px-4 py-2 text-sm font-semibold text-[#3f6b3f] transition hover:bg-[#e7efe1]"
        >
          {t("exportCsv")}
        </button>
      </div>

      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7566]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchProfilesPlaceholder")}
          className="w-full rounded-lg border border-[#e7e2d8] bg-white py-2.5 pl-9 pr-3 text-sm text-[#2b2a24] outline-none transition focus:border-[#3f6b3f] focus:ring-2 focus:ring-[#3f6b3f]/15"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-[#55503f]">{t("noProfiles")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#e7e2d8] bg-white">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#e7e2d8] text-left text-xs font-semibold uppercase tracking-wide text-[#7a7566]">
                <th className="px-4 py-3">{tProfile("businessName")}</th>
                <th className="px-4 py-3">{t("colCategories")}</th>
                <th className="px-4 py-3">{t("colStatus")}</th>
                <th className="px-4 py-3">{t("colListings")}</th>
                <th className="px-4 py-3">{tDashboard("views")}</th>
                <th className="px-4 py-3">{t("colCreated")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-[#f0ede4] last:border-b-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/profiles/${p.slug}`}
                      className="font-medium text-[#2b2a24] hover:text-[#3f6b3f]"
                    >
                      {p.businessName}
                    </Link>
                    {p.address && <div className="text-xs text-[#7a7566]">{p.address}</div>}
                  </td>
                  <td className="max-w-48 px-4 py-3 text-[#55503f]">
                    {p.categories.length > 0 ? p.categories.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          p.status === "active"
                            ? "bg-[#e7efe1] text-[#3f6b3f]"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.status === "active" ? t("profileActive") : t("profileSuspended")}
                      </span>
                      {p.verified && <IconCheck className="h-4 w-4 flex-shrink-0 text-[#2563eb]" />}
                      {p.adminBadge && <IconShield className="h-4 w-4 flex-shrink-0 text-red-600" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#55503f]">{p.listingsCount}</td>
                  <td className="px-4 py-3 text-[#55503f]">{p.viewCount + p.listingViewCount}</td>
                  <td className="px-4 py-3 text-[#55503f]">
                    {new Date(p.createdAt).toLocaleDateString(locale === "lv" ? "lv-LV" : "en-GB")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={deleteProfileAsAdmin.bind(null, locale, p.id)}
                      onSubmit={(e) => {
                        if (!confirm(t("deleteProfileConfirmAdmin"))) e.preventDefault();
                      }}
                    >
                      <button
                        type="submit"
                        className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        <IconTrash className="h-4 w-4" />
                        {t("delete")}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
