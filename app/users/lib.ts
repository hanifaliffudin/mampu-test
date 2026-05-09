export type UserDetails = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
  };
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
  };
};

export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

export type UserActivity = {
  totalPosts: number;
  completedTodos: number;
  pendingTodos: number;
};

export type UserWithActivity = UserDetails & {
  activity: UserActivity;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Failed request: ${url}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchUsers(): Promise<UserDetails[]> {
  return fetchJson<UserDetails[]>("https://jsonplaceholder.typicode.com/users");
}

export async function fetchPosts(): Promise<Post[]> {
  return fetchJson<Post[]>("https://jsonplaceholder.typicode.com/posts");
}

export async function fetchTodos(): Promise<Todo[]> {
  return fetchJson<Todo[]>("https://jsonplaceholder.typicode.com/todos");
}

export async function fetchUserById(id: string): Promise<UserDetails> {
  const user = await fetchJson<Partial<UserDetails>>(
    `https://jsonplaceholder.typicode.com/users/${id}`,
  );

  if (!user.id) {
    throw new Error("User not found");
  }

  return user as UserDetails;
}

export function buildActivityByUser(
  posts: Post[],
  todos: Todo[],
): Map<number, UserActivity> {
  const map = new Map<number, UserActivity>();

  for (const post of posts) {
    const current = map.get(post.userId) ?? {
      totalPosts: 0,
      completedTodos: 0,
      pendingTodos: 0,
    };
    current.totalPosts += 1;
    map.set(post.userId, current);
  }

  for (const todo of todos) {
    const current = map.get(todo.userId) ?? {
      totalPosts: 0,
      completedTodos: 0,
      pendingTodos: 0,
    };

    if (todo.completed) {
      current.completedTodos += 1;
    } else {
      current.pendingTodos += 1;
    }

    map.set(todo.userId, current);
  }

  return map;
}

export function formatWebsiteUrl(website: string): string {
  return website.startsWith("http") ? website : `https://${website}`;
}
