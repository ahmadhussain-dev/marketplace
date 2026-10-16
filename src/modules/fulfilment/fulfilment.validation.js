
import { z } from "zod";

export const sellerStatusSchema = z.object({
  status: z.enum([
    "processing",
    "shipped",
    "delivered",
  ]),

  trackingNumber: z.string()
    .trim()
    .max(100)
    .default(""),

  carrierName: z.string()
    .trim()
    .max(100)
    .default(""),
});

export const codConfirmationSchema = z.object({
  collectionReference: z.string()
    .trim()
    .min(6)
    .max(120),
});
