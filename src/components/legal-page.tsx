export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div>
        <h1 className="text-2xl font-semibold text-[#1d2329] sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-[#5d6670]">{updated}</p>
      </div>
      <div className="flex flex-col gap-6 rounded-2xl border border-[#e3e6e8] bg-white p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-base font-semibold text-[#1d2329]">{title}</h2>
      <div className="flex flex-col gap-2.5 text-sm leading-relaxed text-[#5d6670]">{children}</div>
    </section>
  );
}
