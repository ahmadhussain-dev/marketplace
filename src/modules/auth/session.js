
import "server-only";

import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db/mongoose";
import { Session } from "@/modules/auth/session.model";
import { findUserById, } from "@/modules/users/user.repository";

const COOKIE_NAME = "marketplace_session";
const SESSION_AGE = 60 * 60 * 24 * 7;

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_AGE,
};

export function hashToken(token) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function createSession(userId) {
  await connectDB();

  const token = randomBytes(32).toString("hex");

  await Session.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(
      Date.now() + SESSION_AGE * 1000
    ),
  });

  return token;
}

export async function setSessionCookie(token) {
  const cookieStore = await cookies();

  cookieStore.set(
    COOKIE_NAME,
    token,
    sessionCookieOptions
  );
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  await connectDB();

  const session = await Session.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  });

  if (!session) return null;

  const user = await findUserById(session.userId);

  if (!user || user.status === "suspended") {
    return null;
  }

  return user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    await connectDB();

    await Session.deleteOne({
      tokenHash: hashToken(token),
    });
  }

  cookieStore.delete(COOKIE_NAME);
}

export async function requireRole(role) {
  const user = await getCurrentUser();

  if (!user || user.role !== role) {
    return null;
  }

  if (user.status !== "active" &&
      role !== "seller") {
    return null;
  }

  return user;
}
