
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireRole } from "@/modules/auth/session";
import { rejectCrossOrigin } from "@/lib/auth/origin";

import { createCategory } from "@/modules/categories/category.repository";

// export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
});

export async function POST(request) {
  const rejected = rejectCrossOrigin(request);
  if (rejected) return rejected;

  const admin = await requireRole("admin");

  if (!admin || admin.status !== "active") {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid category data" },
      { status: 400 }
    );
  }

  const slug = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    return NextResponse.json(
      { message: "Invalid category name" },
      { status: 400 }
    );
  }

  try {
    const category = await createCategory({
      name: parsed.data.name,
      slug,
    });

    return NextResponse.json(
      {
        success: true,
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 409 }
      );
    }

    console.error("Create category failed:", error);

    return NextResponse.json(
      { message: "Unable to create category" },
      { status: 500 }
    );
  }
}
