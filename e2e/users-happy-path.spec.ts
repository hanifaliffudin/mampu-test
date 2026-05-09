import { expect, test } from "@playwright/test";

const users = Array.from({ length: 10 }).map((_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  username: `user${index + 1}`,
  email: `user${index + 1}@example.com`,
  phone: `000-000-${String(index + 1).padStart(4, "0")}`,
  website: `user${index + 1}.dev`,
  company: {
    name: `Company ${index + 1}`,
    catchPhrase: `Catch ${index + 1}`,
  },
  address: {
    street: `Street ${index + 1}`,
    suite: `Suite ${index + 1}`,
    city: `City ${index + 1}`,
    zipcode: `ZIP${index + 1}`,
  },
}));

const posts = users.flatMap((user) =>
  Array.from({ length: 2 }).map((_, index) => ({
    userId: user.id,
    id: user.id * 100 + index,
    title: `Post ${index + 1} for ${user.name}`,
    body: `Body ${index + 1} for ${user.name}`,
  })),
);

const todos = users.flatMap((user) => [
  { userId: user.id, id: user.id * 10 + 1, title: `Done for ${user.name}`, completed: true },
  {
    userId: user.id,
    id: user.id * 10 + 2,
    title: `Pending for ${user.name}`,
    completed: false,
  },
]);

test("users list to details happy path", async ({ page }) => {
  await page.route("**/*", async (route) => {
    const url = route.request().url();

    if (!url.includes("jsonplaceholder.typicode.com")) {
      await route.continue();
      return;
    }

    if (url.includes("/users/") && !url.endsWith("/users")) {
      const id = Number(url.split("/").pop());
      const user = users.find((item) => item.id === id);
      await route.fulfill({ status: user ? 200 : 404, json: user ?? {} });
      return;
    }

    if (url.includes("/users")) {
      await route.fulfill({ json: users });
      return;
    }

    if (url.includes("/posts")) {
      await route.fulfill({ json: posts });
      return;
    }

    if (url.includes("/todos")) {
      await route.fulfill({ json: todos });
      return;
    }

    await route.fulfill({ json: {} });
  });

  await page.goto("/users");

  await expect(page.getByRole("heading", { name: "Users List" })).toBeVisible();
  await expect(page.getByText("Page 1 of 2")).toBeVisible();

  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(/page=2/);

  await page.getByRole("button", { name: "Previous" }).click();
  await expect(page).toHaveURL(/page=1/);

  await page.locator('a[href^="/users/1"]').first().click();

  await expect(page).toHaveURL(/\/users\/1/);
  await expect(page.getByRole("heading", { name: "User 1" })).toBeVisible();
  await expect(page.getByText("Posts")).toBeVisible();
  await expect(page.getByText("Todos")).toBeVisible();

  await page.getByRole("link", { name: "Back to list" }).click();
  await expect(page).toHaveURL(/\/users\?/);
});
