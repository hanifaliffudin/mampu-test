import { render, screen } from "@testing-library/react";

import UserDetailsError from "./error";
import LoadingUserDetails from "./loading";
import UserDetailsPage from "./page";

const notFoundMock = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

jest.mock("next/navigation", () => ({
  notFound: () => notFoundMock(),
}));

function mockFetchResponse(data: unknown): Response {
  return {
    ok: true,
    json: async () => data,
  } as Response;
}

describe("User details route", () => {
  beforeEach(() => {
    notFoundMock.mockClear();
    jest.clearAllMocks();
  });

  it("renders user details with posts and todos sections", async () => {
    global.fetch = jest.fn().mockImplementation(async (input) => {
      const url = String(input);

      if (url.endsWith("/users/1")) {
        return mockFetchResponse({
          id: 1,
          name: "Alice Johnson",
          username: "alice",
          email: "alice@example.com",
          phone: "1-111-1111",
          website: "alice.dev",
          company: { name: "A Corp", catchPhrase: "Ship fast" },
          address: { street: "Main", suite: "Apt 1", city: "City", zipcode: "12345" },
        });
      }

      if (url.includes("/posts")) {
        return mockFetchResponse([
          { userId: 1, id: 10, title: "post 1", body: "body 1" },
          { userId: 1, id: 11, title: "post 2", body: "body 2" },
        ]);
      }

      return mockFetchResponse([
        { userId: 1, id: 1, title: "todo done", completed: true },
        { userId: 1, id: 2, title: "todo pending", completed: false },
      ]);
    });

    const view = await UserDetailsPage({
      params: Promise.resolve({ id: "1" }),
      searchParams: Promise.resolve({ q: "alice", sort: "name-asc" }),
    });

    render(view);

    expect(screen.getByRole("heading", { name: "Alice Johnson" })).toBeInTheDocument();
    expect(screen.getByText(/total posts: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/completed: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/pending: 1/i)).toBeInTheDocument();

    const backLink = screen.getByRole("link", { name: /back to list/i });
    expect(backLink).toHaveAttribute("href", "/users?q=alice&sort=name-asc");
  });

  it("handles invalid user id", async () => {
    await expect(
      UserDetailsPage({
        params: Promise.resolve({ id: "abc" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFoundMock).toHaveBeenCalled();
  });

  it("handles missing user data", async () => {
    global.fetch = jest.fn().mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/users/2")) {
        return mockFetchResponse({});
      }
      return mockFetchResponse([]);
    });

    await expect(
      UserDetailsPage({
        params: Promise.resolve({ id: "2" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFoundMock).toHaveBeenCalled();
  });

  it("renders loading and error states", () => {
    render(<LoadingUserDetails />);
    expect(screen.getByText(/loading user details/i)).toBeInTheDocument();

    render(<UserDetailsError />);
    expect(
      screen.getByText(/something went wrong while loading this user/i),
    ).toBeInTheDocument();
  });
});
