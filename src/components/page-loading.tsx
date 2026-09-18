import { Spinner } from "./spinner";

export function PageLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24 text-[#3f6b3f]">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
