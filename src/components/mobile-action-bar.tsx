export function MobileActionBar({
  phone,
  phoneLabel,
  message,
}: {
  phone: string | null;
  phoneLabel: string;
  message: React.ReactNode;
}) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[2000] gap-2.5 border-t border-[#e3e6e8] bg-white px-4 pb-[26px] pt-2.5 sm:hidden ${
        phone ? "grid grid-cols-[1fr_1.3fr]" : "flex"
      }`}
    >
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex items-center justify-center whitespace-nowrap rounded-xl border border-[#d9dee2] px-2 text-[15px] font-semibold text-[#1d2329]"
        >
          {phoneLabel}
        </a>
      )}
      <div className="flex flex-1 items-stretch justify-center [&>*]:flex-1 [&>a]:flex [&>a]:items-center [&>a]:justify-center [&>form]:flex [&>form>button]:w-full">
        {message}
      </div>
    </div>
  );
}
