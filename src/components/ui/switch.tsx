"use client";

export function Switch({
  checked,
  onChange,
  label,
  name,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  name?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[31px] w-[51px] flex-shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-[#3f6e4a]" : "bg-[#e9e9eb]"
      }`}
    >
      <span
        className="absolute left-0.5 h-[27px] w-[27px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25),0_1px_1px_rgba(0,0,0,0.16)] transition-transform duration-200 motion-reduce:transition-none"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0px)" }}
      />
      {name && <input type="hidden" name={name} value={checked ? "true" : "false"} />}
    </button>
  );
}
