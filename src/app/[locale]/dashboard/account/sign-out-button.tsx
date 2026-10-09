import { signOut } from "@/app/[locale]/auth/actions";

export function SignOutButton({ locale, label }: { locale: string; label: string }) {
  const boundSignOut = signOut.bind(null, locale);
  return (
    <form action={boundSignOut} className="sm:hidden">
      <button
        type="submit"
        className="w-full rounded-xl border border-[#d9dee2] bg-white py-[13px] text-center text-[15px] font-medium text-[#5d6670]"
      >
        {label}
      </button>
    </form>
  );
}
