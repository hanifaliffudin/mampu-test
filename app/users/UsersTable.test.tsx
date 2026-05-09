import { render, screen, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";

import UsersTable from "./UsersTable";

let currentSearch = "";
const replaceMock = jest.fn((url: string) => {
  const [, queryString = ""] = url.split("?");
  currentSearch = queryString;
});

jest.mock("next/navigation", () => ({
  usePathname: () => "/users",
  useRouter: () => ({
    replace: replaceMock,
  }),
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

function renderUsersTable() {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <UsersTable />
    </SWRConfig>,
  );
}

function mockFetchResponse(data: unknown): Response {
  return {
    ok: true,
    json: async () => data,
  } as Response;
}

const usersPayload = [
  {
    id: 1,
    name: "Alice Johnson",
    username: "alice",
    email: "alice@example.com",
    phone: "1-111-1111",
    website: "alice.dev",
    company: { name: "A Corp", catchPhrase: "A" },
    address: { street: "A", suite: "1", city: "A", zipcode: "111" },
  },
  {
    id: 2,
    name: "Bob Smith",
    username: "bob",
    email: "bob@example.com",
    phone: "2-222-2222",
    website: "bob.dev",
    company: { name: "B Corp", catchPhrase: "B" },
    address: { street: "B", suite: "2", city: "B", zipcode: "222" },
  },
];

const postsPayload = [
  { userId: 1, id: 1, title: "a", body: "a" },
  { userId: 1, id: 2, title: "b", body: "b" },
  { userId: 2, id: 3, title: "c", body: "c" },
];

const todosPayload = [
  { userId: 1, id: 1, title: "todo 1", completed: true },
  { userId: 1, id: 2, title: "todo 2", completed: false },
  { userId: 2, id: 3, title: "todo 3", completed: false },
  { userId: 2, id: 4, title: "todo 4", completed: false },
];

describe("UsersTable", () => {
  beforeEach(() => {
    currentSearch = "";
    replaceMock.mockClear();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("renders users with derived activity signals", async () => {
    (global.fetch as jest.Mock).mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/users")) return mockFetchResponse(usersPayload);
      if (url.includes("/posts")) return mockFetchResponse(postsPayload);
      return mockFetchResponse(todosPayload);
    });

    renderUsersTable();

    expect(await screen.findAllByRole("link", { name: "Alice Johnson" })).toHaveLength(2);
    expect(screen.getAllByText("Posts: 2")).toHaveLength(1);
    expect(screen.getAllByText("Pending: 2")).toHaveLength(1);
  });

  it("filters by search and applies additional filter/sort", async () => {
    (global.fetch as jest.Mock).mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/users")) return mockFetchResponse(usersPayload);
      if (url.includes("/posts")) return mockFetchResponse(postsPayload);
      return mockFetchResponse(todosPayload);
    });

    const { rerender } = renderUsersTable();
    await screen.findAllByRole("link", { name: "Alice Johnson" });

    currentSearch = "q=alice";
    rerender(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <UsersTable />
      </SWRConfig>,
    );

    await waitFor(() => {
      expect(screen.getAllByRole("link", { name: "Alice Johnson" })).toHaveLength(2);
      expect(screen.queryAllByRole("link", { name: "Bob Smith" })).toHaveLength(0);
    });

    currentSearch = "filter=with-pending&sort=pending-desc";
    rerender(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <UsersTable />
      </SWRConfig>,
    );

    await waitFor(() => {
      const userLinks = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("href")?.startsWith("/users/"))
        .filter((link) => link.textContent === "Alice Johnson" || link.textContent === "Bob Smith");

      expect(userLinks[0]).toHaveTextContent("Bob Smith");
    });
  });

  it("shows loading, error, and empty states", async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { unmount } = renderUsersTable();
    expect(screen.getByText(/loading users and activity data/i)).toBeInTheDocument();
    unmount();

    (global.fetch as jest.Mock).mockRejectedValue(new Error("network"));
    const { unmount: unmountError } = renderUsersTable();
    expect(await screen.findByText(/failed to load users workspace data/i)).toBeInTheDocument();
    unmountError();

    currentSearch = "q=nomatch";
    (global.fetch as jest.Mock).mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/users")) return mockFetchResponse(usersPayload);
      if (url.includes("/posts")) return mockFetchResponse(postsPayload);
      return mockFetchResponse(todosPayload);
    });

    renderUsersTable();
    expect(
      await screen.findByText(/no users match your current search and filters/i),
    ).toBeInTheDocument();
  });
});
