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

export async function fetchUserById(id: string): Promise<UserDetails> {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users/${id}`,
    {
      next: { revalidate: 300 },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user details");
  }

  const user = (await response.json()) as Partial<UserDetails>;

  if (!user.id) {
    throw new Error("User not found");
  }

  return user as UserDetails;
}
