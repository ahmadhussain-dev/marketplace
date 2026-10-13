import {z} from "zod";
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  password: z.string().min(12).max(72),
  role: z.enum(["customer", "seller"]),
  storeName: z.string().trim().max(120).optional(),
}).superRefine((data, ctx) => {
  if (data.role === "seller" && (!data.storeName || data.storeName.length < 2)) {
    ctx.addIssue({
      code4: "custom",
      path: ["storeName"],
      message: "Store name is required for sellers",
    });
    
  }
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  role: z.enum(["customer", "seller", "admin"]),
});