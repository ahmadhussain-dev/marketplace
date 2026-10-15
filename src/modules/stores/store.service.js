import "server-only";

import {createStore,findStoreByOwner} from "./store.repository";

export async function registerStore(seller, data) {

  if(seller.role !== "seller" || seller.status !== "active") {
    throw new Error("SELLER_NOT_APPROVED");
  }

  const existing = await findStoreByOwner(seller._id);
  if(existing) {
    throw new Error("STORE_ALREADY_EXISTS");
  }

  try {
    return await createStore({
      ownerId: seller._id,
      name: data.name,
      description: data.description,
      country: data.country,
    });

  } catch (error) {
    if(error.code === 11000) {
      throw new Error("STORE_ALREADY_EXISTS");
    }
    throw error;
  }
}
