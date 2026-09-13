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
        className="w-fit rounded-full border border-[#3f6b3f] px-5 py-2.5 text-sm font-semibold text-[#3f6b3f]"
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
        className="w-fit rounded-full bg-[#3f6b3f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2f5233]"
      >
        {t("messageSeller")}
      </button>
    </form>
  );
}
