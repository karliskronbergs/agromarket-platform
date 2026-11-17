"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { springDefault, fadeTransition, usePrefersReducedMotion, useMediaQuery } from "@/lib/motion";

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
  const reducedMotion = usePrefersReducedMotion();
  const isWide = useMediaQuery("(min-width: 640px)");

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[3000] bg-[rgba(20,26,32,.4)]"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fadeTransition}
            />
            <div className="pointer-events-none fixed inset-0 z-[3001] flex items-end justify-center sm:items-center sm:p-4">
              <motion.div
                initial={reducedMotion ? { opacity: 0 } : isWide ? { opacity: 0, scale: 0.92 } : { opacity: 0, y: "100%" }}
                animate={reducedMotion ? { opacity: 1 } : isWide ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : isWide ? { opacity: 0, scale: 0.92 } : { opacity: 0, y: "100%" }}
                transition={reducedMotion ? fadeTransition : springDefault}
                className="pointer-events-auto flex w-full flex-col gap-3 rounded-t-[22px] bg-white p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] shadow-[0_-8px_30px_rgba(20,26,32,0.18)] sm:w-[380px] sm:rounded-[18px] sm:p-6 sm:pb-6 sm:shadow-[0_20px_50px_rgba(29,35,41,0.25)]"
              >
                <div className="text-base font-semibold text-[#1d2329]">{title}</div>
                <p className="m-0 text-sm leading-[1.5] text-[#5d6670]">{text}</p>
                <form
                  action={async () => {
                    setOpen(false);
                    await action();
                  }}
                >
                  <button
                    type="submit"
                    className="w-full rounded-[12px] bg-[#b3261e] py-3.5 text-[15px] font-semibold text-white hover:bg-[#962019]"
                  >
                    {cta}
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-[12px] py-3.5 text-[15px] font-medium text-[#5d6670]"
                >
                  {cancelLabel}
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
