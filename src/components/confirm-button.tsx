"use client";

import { useState } from "react";

export function ConfirmButton({
  action,
  title,
  text,
  cta,
  cancelLabel,
  triggerClassName,
  triggerLabel,
}: {
  action: () => Promise<void> | void;
  title: string;
  text: string;
  cta: string;
  cancelLabel: string;
  triggerClassName: string;
  triggerLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-[rgba(29,35,41,0.45)] p-5"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-[420px] flex-col gap-3 rounded-[18px] bg-white p-6 shadow-[0_20px_50px_rgba(29,35,41,0.25)]"
          >
            <div className="text-lg font-semibold text-[#1d2329]">{title}</div>
            <div className="text-[15px] leading-[1.5] text-[#5d6670]">{text}</div>
            <div className="mt-2 flex flex-wrap justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-[10px] border border-[#d9dee2] px-4 py-2.5 text-[15px] font-medium text-[#1d2329]"
              >
                {cancelLabel}
              </button>
              <form
                action={async () => {
                  setOpen(false);
                  await action();
                }}
              >
                <button
                  type="submit"
                  className="rounded-[10px] bg-[#b3261e] px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-[#962019]"
                >
                  {cta}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
