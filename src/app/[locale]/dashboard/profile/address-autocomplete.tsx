"use client";

import { useEffect, useRef, useState } from "react";
import { searchAddresses } from "./address-search";

export function AddressAutocomplete({
  id,
  name,
  defaultValue,
  className,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  className: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleChange(newValue: string) {
    setValue(newValue);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (newValue.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const thisRequest = ++requestId.current;
    debounceRef.current = setTimeout(async () => {
      const results = await searchAddresses(newValue);
      if (thisRequest !== requestId.current) return; // a newer keystroke superseded this one
      setSuggestions(results);
      setOpen(results.length > 0);
    }, 500);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        name={name}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        autoComplete="off"
        required
        className={className}
      />
      {open && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[#e7e2d8] bg-white shadow-lg">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setValue(s);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-[#faf8f3]"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
