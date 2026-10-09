import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { startConversation } from "@/app/[locale]/dashboard/messages/actions";

export async function MessageSellerButton({
  locale,
  viewerUserId,
  sellerUserId,
  listingId,
}: {
  locale: string;
  viewerUserId: string | null;
  sellerUserId: string;
  listingId?: string;
}) {
  const t = await getTranslations("Messages");

  if (viewerUserId === sellerUserId) return null;

  if (!viewerUserId) {
    return (
      <Link
        href="/auth/login"
        className="w-fit rounded-[10px] border border-[#d9dee2] px-5 py-3 text-[15px] font-medium text-[#1d2329]"
      >
        {t("loginToMessage")}
      </Link>
    );
  }

  const boundStart = startConversation.bind(null, locale, sellerUserId, listingId ?? null);

  return (
    <form action={boundStart}>
      <button
        type="submit"
        className="w-fit rounded-[10px] bg-[#3f6e4a] px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#355d3e]"
      >
        {t("messageSeller")}
      </button>
    </form>
  );
}
