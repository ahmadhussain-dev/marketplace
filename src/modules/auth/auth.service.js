
import "server-only";
import bcrypt from "bcryptjs";
import {findUserByEmail,createUser,} from "@/modules/users/user.repository";
import { createSession } from "./session";
export async function registerUser(data) {
  const email = data.email.trim().toLowerCase();

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const passwordHash = await bcrypt.hash(
    data.password,
    12
  );

  try {
    const user = await createUser({
      name: data.name,
      email,
      passwordHash,
      role: data.role,

      status:
        data.role === "seller"
          ? "pending"
          : "active",

      ...(data.role === "seller" && {
        storeName: data.storeName,
      }),
    });

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Email is already registered");
    }

    throw error;
  }
}

export async function loginUser(data) {
  const user = await findUserByEmail(data.email);
  console.log("User found:", Boolean(user));
console.log("Requested role:", data.role);
console.log("Stored role:", user?.role);
console.log("Password hash exists:", Boolean(user?.passwordHash));
console.log("Account status:", user?.status);

  if (!user || user.role !== data.role) {
    throw new Error("Invalid credentials");
  }

  const passwordMatches = await bcrypt.compare(
    data.password,
    user.passwordHash
  );
  console.log("Password matches:", passwordMatches);

  if (!passwordMatches) {
    throw new Error("Invalid credentials");
  }

  if (user.status === "suspended") {
    throw new Error("Account is unavailable");
  }

  const token = await createSession(user._id);

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
}
