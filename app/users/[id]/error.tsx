"use client";

import Link from "next/link";

type UserDetailsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function UserDetailsError({ error, reset }: UserDetailsErrorProps) {
  return (
    <main className="flex flex-1 items-start justify-center bg-zinc-50 px-4 py-8 sm:px-8">
      <section className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Something went wrong while loading this user.
        </p>
        <p className="mt-3 text-xs text-zinc-500">{error.message}</p>
        <div className="mt-4 flex items-center gap-3">
          <button
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700"
            onClick={reset}
            type="button"
          >
            Try again
          </button>
          <Link
            href="/users"
            className="text-sm font-medium text-blue-700 underline"
          >
            Back to list
          </Link>
        </div>
      </section>
    </main>
  );
}
