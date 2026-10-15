
import { z } from "zod";

export const baseProductSchema = z.object({
  name: z.string().trim().min(2).max(160),

  description: z.string().trim().max(3000),

  categoryId: z.string().regex(/^[a-fA-F0-9]{24}$/),

  sku: z.string().trim()
    .min(2).max(60)
    .regex(/^[A-Za-z0-9_-]+$/)
    .transform(value => value.toUpperCase()),

  priceMinor: z.number().int().min(0)
    .max(1_000_000_000),

  currency: z.enum(["USD", "PKR", "EUR", "GBP"]),

  stock: z.number().int().min(0).max(1_000_000),

  imageUrl: z.union([
    z.literal(""),
    z.url().refine(
      value => new URL(value).protocol === "https:",
      "An HTTPS image URL is required"
    ),
  ]),

  status: z.enum(["draft", "published"]),
});

export const productSchema = baseProductSchema.superRefine(
  (data, ctx) => {
    if (data.status === "published" && data.stock === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["stock"],
        message: "Published products must have stock",
      });
    }

    if (
      data.status === "published" &&
      data.priceMinor === 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["priceMinor"],
        message: "Published products require a price",
      });
    }
  }
);

// 3. Partial schema for PATCH requests
export const updateProductSchema =
  baseProductSchema.partial();