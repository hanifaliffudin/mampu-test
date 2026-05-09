export default function LoadingUserDetails() {
  return (
    <main className="flex flex-1 items-start justify-center bg-zinc-50 px-4 py-8 sm:px-8">
      <section className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm text-zinc-600">Loading user details...</p>
        <div className="space-y-3" aria-live="polite">
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-zinc-100" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-24 animate-pulse rounded-xl bg-zinc-100" />
            <div className="h-24 animate-pulse rounded-xl bg-zinc-100" />
          </div>
          <div className="h-32 animate-pulse rounded-xl bg-zinc-100" />
        </div>
      </section>
    </main>
  );
}
