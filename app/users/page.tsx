import UsersTable from "./UsersTable";

export default function UsersPage() {
  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-8 sm:px-8">
      <div className="mb-6 w-full max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Users List
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Data source: jsonplaceholder.typicode.com/users
        </p>
      </div>
      <UsersTable />
    </main>
  );
}
