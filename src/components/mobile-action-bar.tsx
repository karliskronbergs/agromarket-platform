export function MobileActionBar({
  typeLabel,
  price,
  phone,
  phoneLabel,
  message,
}: {
  typeLabel?: string;
  price?: React.ReactNode;
  phone: string | null;
  phoneLabel: string;
  message: React.ReactNode;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[2000] flex items-center gap-2.5 bg-white/[0.86] px-4 pb-[26px] pt-2.5 shadow-[0_-1px_0_rgba(20,26,32,0.08)] backdrop-blur-[24px] backdrop-saturate-[1.8] sm:hidden">
      {price != null && (
        <div className="min-w-0 flex-1">
          {typeLabel && <div className="truncate text-xs text-[#5d6670]">{typeLabel}</div>}
          <div className="truncate text-[19px] font-semibold leading-tight tracking-[-0.01em] text-[#1d2329]">{price}</div>
        </div>
      )}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex flex-shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-[#d9dee2] px-3.5 py-3.5 text-[15px] font-semibold text-[#1d2329]"
        >
          {phoneLabel}
        </a>
      )}
      <div className="flex flex-shrink-0 items-stretch justify-center [&>*]:flex-1 [&>a]:flex [&>a]:items-center [&>a]:justify-center [&>form]:flex [&>form>button]:w-full">
        {message}
      </div>
    </div>
  );
}
