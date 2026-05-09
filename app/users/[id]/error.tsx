"use client";

import Link from "next/link";

export default function UserDetailsError() {
  return (
    <main className="flex flex-1 items-start justify-center bg-zinc-50 px-4 py-8 sm:px-8">
      <section className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Something went wrong while loading this user.
        </p>
        <Link
          href="/users"
          className="mt-4 inline-block text-sm font-medium text-blue-700 underline"
        >
          Back to list
        </Link>
      </section>
    </main>
  );
}
