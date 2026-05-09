"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useMemo } from "react";

import {
  buildActivityByUser,
  fetchPosts,
  fetchTodos,
  fetchUsers,
  formatWebsiteUrl,
  type UserDetails,
  type UserWithActivity,
} from "./lib";

type SortOption = "name-asc" | "name-desc" | "pending-desc";
type FilterOption = "all" | "with-pending" | "no-completed";

type UsersDataBundle = {
  users: UserDetails[];
  usersWithActivity: UserWithActivity[];
};

const DEFAULT_SORT: SortOption = "name-asc";
const DEFAULT_FILTER: FilterOption = "all";

const bundleFetcher = async (): Promise<UsersDataBundle> => {
  const [users, posts, todos] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchTodos(),
  ]);

  const activityByUser = buildActivityByUser(posts, todos);

  const usersWithActivity = users.map((user) => ({
    ...user,
    activity: activityByUser.get(user.id) ?? {
      totalPosts: 0,
      completedTodos: 0,
      pendingTodos: 0,
    },
  }));

  return { users, usersWithActivity };
};

function useQueryState() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const query = searchParams.get("q") ?? "";
  const sort = (searchParams.get("sort") as SortOption | null) ?? DEFAULT_SORT;
  const filter =
    (searchParams.get("filter") as FilterOption | null) ?? DEFAULT_FILTER;

  const setParams = (updates: Record<string, string>) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    }

    const queryString = nextParams.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  return { query, sort, filter, setParams, searchParams };
}

function applyFilter(user: UserWithActivity, filter: FilterOption): boolean {
  switch (filter) {
    case "with-pending":
      return user.activity.pendingTodos > 0;
    case "no-completed":
      return user.activity.completedTodos === 0;
    default:
      return true;
  }
}

function sortUsers(users: UserWithActivity[], sort: SortOption): UserWithActivity[] {
  return [...users].sort((a, b) => {
    if (sort === "pending-desc") {
      if (b.activity.pendingTodos !== a.activity.pendingTodos) {
        return b.activity.pendingTodos - a.activity.pendingTodos;
      }
      return a.name.localeCompare(b.name);
    }

    const direction = sort === "name-desc" ? -1 : 1;
    return a.name.localeCompare(b.name) * direction;
  });
}

export default function UsersTable() {
  const { query, sort, filter, setParams, searchParams } = useQueryState();

  const { data, error, isLoading } = useSWR("users-ops-bundle", bundleFetcher);

  const visibleUsers = useMemo(() => {
    if (!data) {
      return [];
    }

    const loweredQuery = query.trim().toLowerCase();

    const filtered = data.usersWithActivity.filter((user) => {
      const matchesSearch =
        !loweredQuery ||
        user.name.toLowerCase().includes(loweredQuery) ||
        user.email.toLowerCase().includes(loweredQuery);

      return matchesSearch && applyFilter(user, filter);
    });

    return sortUsers(filtered, sort);
  }, [data, filter, query, sort]);

  return (
    <section className="w-full max-w-6xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input
          aria-label="Search users"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-300"
          onChange={(event) => setParams({ q: event.target.value })}
          placeholder="Search by name or email"
          value={query}
        />

        <select
          aria-label="Filter users"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-zinc-300"
          onChange={(event) => setParams({ filter: event.target.value })}
          value={filter}
        >
          <option value="all">All users</option>
          <option value="with-pending">Has pending todos</option>
          <option value="no-completed">No completed todos</option>
        </select>

        <select
          aria-label="Sort users"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-zinc-300"
          onChange={(event) => setParams({ sort: event.target.value })}
          value={sort}
        >
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="pending-desc">Most pending todos</option>
        </select>
      </div>

      {isLoading ? (
        <div aria-live="polite" className="space-y-3">
          <p className="text-sm text-zinc-600">Loading users and activity data...</p>
          <div className="hidden space-y-2 md:block">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                className="h-10 animate-pulse rounded-lg bg-zinc-100"
                key={`desktop-skeleton-${index}`}
              />
            ))}
          </div>
          <div className="space-y-2 md:hidden">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                className="h-24 animate-pulse rounded-xl bg-zinc-100"
                key={`mobile-skeleton-${index}`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Failed to load users workspace data. Please refresh.
        </p>
      ) : null}

      {!isLoading && !error ? (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <caption className="sr-only">
                User activity table with posts, completed todos, and pending todos
              </caption>
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-3 py-2 font-semibold text-zinc-700" scope="col">Name</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700" scope="col">Email</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700" scope="col">Website</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700" scope="col">Posts</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700" scope="col">Completed</th>
                  <th className="px-3 py-2 font-semibold text-zinc-700" scope="col">Pending</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => (
                  <tr className="border-b border-zinc-100 hover:bg-zinc-50" key={user.id}>
                    <td className="px-3 py-2 text-zinc-900">
                      <Link
                        className="inline-flex rounded px-1 py-0.5 font-medium text-zinc-900 underline transition hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-300"
                        href={`/users/${user.id}?${searchParams.toString()}`}
                      >
                        {user.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-zinc-700 break-all">{user.email}</td>
                    <td className="px-3 py-2">
                      <a
                        className="inline-flex rounded px-1 py-0.5 text-blue-700 underline transition hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-200"
                        href={formatWebsiteUrl(user.website)}
                        rel="noreferrer noopener"
                        target="_blank"
                      >
                        {user.website}
                      </a>
                    </td>
                    <td className="px-3 py-2 text-zinc-700">{user.activity.totalPosts}</td>
                    <td className="px-3 py-2 text-zinc-700">{user.activity.completedTodos}</td>
                    <td className="px-3 py-2 text-zinc-700">{user.activity.pendingTodos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {visibleUsers.map((user) => (
              <article
                className="rounded-xl border border-zinc-200 p-4 shadow-sm"
                key={user.id}
              >
                <Link
                  className="inline-flex rounded text-base font-semibold text-zinc-900 underline focus-visible:ring-2 focus-visible:ring-zinc-300"
                  href={`/users/${user.id}?${searchParams.toString()}`}
                >
                  {user.name}
                </Link>
                <p className="mt-1 break-all text-sm text-zinc-600">{user.email}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-zinc-700">
                  <p className="rounded bg-zinc-100 px-2 py-1">
                    Posts: {user.activity.totalPosts}
                  </p>
                  <p className="rounded bg-zinc-100 px-2 py-1">
                    Done: {user.activity.completedTodos}
                  </p>
                  <p className="rounded bg-zinc-100 px-2 py-1">
                    Pending: {user.activity.pendingTodos}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {visibleUsers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center">
              <p className="text-sm font-medium text-zinc-700">
                No users match your current search and filters.
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Try clearing the query or changing filter/sort options.
              </p>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
