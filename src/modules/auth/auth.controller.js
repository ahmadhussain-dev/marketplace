
import "server-only";

import { NextResponse } from "next/server";

import {
  registerSchema,
  loginSchema,
} from "./auth.validation";

import {
  registerUser,
  loginUser,
} from "./auth.service";
import { setSessionCookie } from "./session";


export async function registerController(request) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid registration data",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const user = await registerUser(parsed.data);

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.message === "Email is already registered") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }

    console.error("Registration failed:", error);

    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 }
    );
  }
}

export async function loginController(request) {
  try {
    const body = await request.json();

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login data",
        },
        { status: 400 }
      );
    }

    const result = await loginUser(parsed.data);

    await setSessionCookie(result.token);

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: result.user,
    });
  } catch (error) {
    if (
      error.message === "Invalid credentials" ||
      error.message === "Account is unavailable"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials or unavailable account",
        },
        { status: 401 }
      );
    }

    console.error("Login failed:", error);

    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}
