import "server-only";

import { requireRole } from "@/modules/auth/session";
import { findStoreByOwner } from "@/modules/stores/store.repository";

export async function getApprovedSellerStore() {
  const user = await requireRole("seller");

  if (!user || user.status !== "active") {
    return null;
  }

  const store = await findStoreByOwner(user._id);

  if (!store || store.status !== "active") {
    return null;
  }

  return store;
}
