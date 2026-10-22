export interface User {
  id: string
  name: string
  email: string
}

export async function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  const res = await fetch(`/api/users/${id}`, { signal })
  if (!res.ok) throw new Error(`fetchUser(${id}) failed: ${res.status}`)
  return (await res.json()) as User
}
