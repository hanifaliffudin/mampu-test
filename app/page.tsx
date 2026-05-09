import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fafc_35%,#ffffff_100%)] px-4 py-16 sm:px-8">
      <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />

      <section className="relative z-10 w-full max-w-3xl rounded-3xl border border-zinc-200/80 bg-white/90 p-8 shadow-xl backdrop-blur sm:p-12">
        <p className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-700">
          User Operations Workspace
        </p>

        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Manage users with activity insights
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
          Explore users, derived post and todo signals, filters, pagination, and
          detailed user operations in one clean interface.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
            href="/users"
          >
            Open Users Workspace
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
            href="/users?filter=with-pending&sort=pending-desc"
          >
            View Pending Todos First
          </Link>
        </div>
      </section>
    </main>
  );
}
