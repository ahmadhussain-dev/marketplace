import "server-only";

import { Store } from "./store.model";
import { connectDB } from "@/lib/db/mongoose";

export async function findStoreByOwner(ownerId) {
  await connectDB();
  return Store.findOne({ownerId});
}

export async function createStore(data) {
  await connectDB();
  return Store.create(data);
}
