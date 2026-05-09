import UsersTable from "./UsersTable";

export default function UsersPage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-gradient-to-b from-zinc-100 via-zinc-50 to-white px-4 py-8 sm:px-8">
      <div className="mb-6 w-full max-w-6xl">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Users List
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          User Operations workspace with activity signals from users, posts, and
          todos.
        </p>
      </div>
      <UsersTable />
    </main>
  );
}
