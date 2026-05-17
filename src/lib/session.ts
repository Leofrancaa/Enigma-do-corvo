import { cookies } from "next/headers";

const SESSION_COOKIE = "cifra_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE);
  if (existing?.value) return existing.value;

  const newId = crypto.randomUUID();
  cookieStore.set(SESSION_COOKIE, newId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
  return newId;
}

export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}
