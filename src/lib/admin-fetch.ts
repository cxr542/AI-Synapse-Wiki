import { getAdminPinHeader } from "./admin-session";

export async function adminFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const pin = getAdminPinHeader();
  const headers = new Headers(init?.headers);
  if (pin) headers.set("X-Wiki-Admin-Pin", pin);
  return fetch(input, { ...init, headers });
}
