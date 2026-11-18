export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8" aria-hidden="true">
      <div className="h-4 w-24 animate-pulse bg-muted" />
      <div className="mt-4 h-14 w-2/3 max-w-xl animate-pulse bg-muted" />
      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div className="aspect-[4/5] animate-pulse bg-muted" />
        <div className="aspect-[4/5] animate-pulse bg-muted" />
      </div>
    </div>
  );
}
