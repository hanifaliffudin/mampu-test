import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  fetchPosts,
  fetchTodos,
  fetchUserById,
  formatWebsiteUrl,
  type Post,
  type Todo,
} from "../lib";

type UserDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function buildBackLink(params: Record<string, string | string[] | undefined>): string {
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        next.append(key, item);
      }
      continue;
    }

    if (typeof value === "string" && value.length > 0) {
      next.set(key, value);
    }
  }

  const query = next.toString();
  return query ? `/users?${query}` : "/users";
}

export async function generateMetadata({
  params,
}: UserDetailsPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const user = await fetchUserById(id);

    return {
      title: `${user.name} | User Operations`,
      description: `Operations overview for ${user.name}, including profile, posts, and todos.`,
    };
  } catch {
    return {
      title: "User Operations | User Details",
      description: "User detail workspace page",
    };
  }
}

function getRecentPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.id - a.id).slice(0, 5);
}

function getTodoSummary(todos: Todo[]): { completed: number; pending: number } {
  const completed = todos.filter((todo) => todo.completed).length;
  return {
    completed,
    pending: todos.length - completed,
  };
}

export default async function UserDetailsPage({
  params,
  searchParams,
}: UserDetailsPageProps) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const backHref = buildBackLink(resolvedSearchParams);

  let user;
  try {
    user = await fetchUserById(id);
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      notFound();
    }
    throw error;
  }

  const [posts, todos] = await Promise.all([fetchPosts(), fetchTodos()]);

  const userPosts = posts.filter((post) => post.userId === user.id);
  const recentPosts = getRecentPosts(userPosts);
  const userTodos = todos.filter((todo) => todo.userId === user.id);
  const todoSummary = getTodoSummary(userTodos);
  const pendingTodos = userTodos.filter((todo) => !todo.completed).slice(0, 5);

  return (
    <main className="flex flex-1 items-start justify-center bg-zinc-50 px-4 py-8 sm:px-8">
      <section className="w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <Link
          href={backHref}
          className="mb-6 inline-block text-sm font-medium text-blue-700 underline"
        >
          Back to list
        </Link>

        <h1 className="break-words text-3xl font-semibold tracking-tight text-zinc-900">
          {user.name}
        </h1>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Contact
            </h2>
            <ul className="space-y-1 text-sm text-zinc-700">
              <li>
                <span className="font-medium text-zinc-900">Username:</span>{" "}
                {user.username}
              </li>
              <li>
                <span className="font-medium text-zinc-900">Email:</span>{" "}
                <span className="break-all">{user.email}</span>
              </li>
              <li>
                <span className="font-medium text-zinc-900">Phone:</span> {user.phone}
              </li>
              <li>
                <span className="font-medium text-zinc-900">Website:</span>{" "}
                <a
                  className="text-blue-700 underline"
                  href={formatWebsiteUrl(user.website)}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {user.website}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Company
            </h2>
            <ul className="space-y-1 text-sm text-zinc-700">
              <li>
                <span className="font-medium text-zinc-900">Name:</span>{" "}
                {user.company.name}
              </li>
              <li>
                <span className="font-medium text-zinc-900">Catchphrase:</span>{" "}
                {user.company.catchPhrase}
              </li>
            </ul>
          </div>

          <div className="sm:col-span-2">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Address
            </h2>
            <p className="break-words text-sm text-zinc-700">
              {user.address.street}, {user.address.suite}, {user.address.city},{" "}
              {user.address.zipcode}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-zinc-200 p-4">
            <h2 className="text-lg font-semibold text-zinc-900">Posts</h2>
            <p className="mt-1 text-sm text-zinc-600">Total posts: {userPosts.length}</p>
            {recentPosts.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {recentPosts.map((post) => (
                  <li className="rounded bg-zinc-100 p-2" key={post.id}>
                    <p className="line-clamp-1 text-sm font-medium text-zinc-900">
                      {post.title}
                    </p>
                    <p className="line-clamp-2 text-xs text-zinc-600">{post.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-zinc-600">No posts available.</p>
            )}
          </section>

          <section className="rounded-xl border border-zinc-200 p-4">
            <h2 className="text-lg font-semibold text-zinc-900">Todos</h2>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-700">
              <p className="rounded bg-zinc-100 px-2 py-1">
                Completed: {todoSummary.completed}
              </p>
              <p className="rounded bg-zinc-100 px-2 py-1">
                Pending: {todoSummary.pending}
              </p>
            </div>

            {pendingTodos.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {pendingTodos.map((todo) => (
                  <li className="rounded bg-zinc-100 p-2 text-sm text-zinc-800" key={todo.id}>
                    {todo.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-zinc-600">No pending todos.</p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
