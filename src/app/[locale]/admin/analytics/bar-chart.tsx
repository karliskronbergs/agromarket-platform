export type DayCount = { date: string; count: number };

export function DailyBarChart({ data, color }: { data: DayCount[]; color: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex h-32 items-end gap-[3px]">
      {data.map((d) => (
        <div
          key={d.date}
          title={`${d.date}: ${d.count}`}
          className="flex-1 rounded-t-sm transition-all"
          style={{
            height: `${Math.max(2, (d.count / max) * 100)}%`,
            background: color,
            opacity: d.count === 0 ? 0.15 : 1,
          }}
        />
      ))}
    </div>
  );
}

export function HorizontalBarList({
  items,
}: {
  items: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-36 flex-shrink-0 truncate text-sm text-[#55503f]">{item.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#f1efe6]">
            <div
              className="h-full rounded-full bg-[#3f6b3f]"
              style={{ width: `${Math.max(3, (item.value / max) * 100)}%` }}
            />
          </div>
          <span className="w-8 flex-shrink-0 text-right text-sm font-semibold text-[#2b2a24]">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
