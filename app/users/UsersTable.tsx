"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  website: string;
};

const fetcher = async (url: string): Promise<User[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};

export default function UsersTable() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortByName, setSortByName] = useState<"asc" | "desc">("asc");

  const { data, error, isLoading } = useSWR<User[]>(
    "https://jsonplaceholder.typicode.com/users",
    fetcher,
  );

  const filteredUsers = useMemo(() => {
    if (!data) {
      return [];
    }

    const loweredQuery = query.trim().toLowerCase();
    const bySearch = data.filter((user) => {
      if (!loweredQuery) {
        return true;
      }

      return (
        user.name.toLowerCase().includes(loweredQuery) ||
        user.email.toLowerCase().includes(loweredQuery)
      );
    });

    return bySearch.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const baseCompare = aName.localeCompare(bName);
      return sortByName === "asc" ? baseCompare : -baseCompare;
    });
  }, [data, query, sortByName]);

  return (
    <section className="w-full max-w-5xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          aria-label="Search users"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-500"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email"
          value={query}
        />
        <button
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-black transition hover:bg-zinc-100"
          onClick={() =>
            setSortByName((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          type="button"
        >
          Sort by name: {sortByName === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      {isLoading ? (
        <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
          Loading users...
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Something went wrong while loading users.
        </p>
      ) : null}

      {!isLoading && !error ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-3 py-2 font-semibold text-zinc-700">Name</th>
                <th className="px-3 py-2 font-semibold text-zinc-700">Email</th>
                <th className="px-3 py-2 font-semibold text-zinc-700">Website</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  className="cursor-pointer border-b border-zinc-100 transition hover:bg-zinc-50 focus-within:bg-zinc-50"
                  key={user.id}
                  onClick={() => router.push(`/users/${user.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/users/${user.id}`);
                    }
                  }}
                  role="link"
                  tabIndex={0}
                >
                  <td className="px-3 py-2 text-zinc-900">{user.name}</td>
                  <td className="px-3 py-2 text-zinc-700">{user.email}</td>
                  <td className="px-3 py-2">
                    <a
                      className="text-blue-700 underline"
                      href={`https://${user.website}`}
                      onClick={(event) => event.stopPropagation()}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      {user.website}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 ? (
            <p className="px-3 py-4 text-sm text-zinc-600">No users found.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
