import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchUserById } from "../lib";

type UserDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: UserDetailsPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const user = await fetchUserById(id);

    return {
      title: `${user.name} | User Details`,
      description: `Details for ${user.name} (${user.email}) on the users directory page.`,
    };
  } catch {
    return {
      title: "User Details",
      description: "User details page",
    };
  }
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  let user;
  try {
    user = await fetchUserById(id);
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      notFound();
    }
    throw error;
  }

  return (
    <main className="flex flex-1 items-start justify-center bg-zinc-50 px-4 py-8 sm:px-8">
      <section className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <Link
          href="/users"
          className="mb-6 inline-block text-sm font-medium text-blue-700 underline"
        >
          Back to list
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
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
                <span className="font-medium text-zinc-900">Email:</span> {user.email}
              </li>
              <li>
                <span className="font-medium text-zinc-900">Phone:</span> {user.phone}
              </li>
              <li>
                <span className="font-medium text-zinc-900">Website:</span>{" "}
                <a
                  className="text-blue-700 underline"
                  href={`https://${user.website}`}
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
            <p className="text-sm text-zinc-700">
              {user.address.street}, {user.address.suite}, {user.address.city},{" "}
              {user.address.zipcode}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
