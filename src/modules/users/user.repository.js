import { connectDB } from "@/lib/db/mongoose";
import {User} from "./user.model";


export async function findUserByEmail(email) {
  const mongoose = await connectDB();

  console.log("Database name:", mongoose.connection.name);

  console.log(
    "Users collection:",
    User.collection.name
  );

  console.log(
    "Email being searched:",
    JSON.stringify(email.trim().toLowerCase())
  );

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select("+passwordHash");

  console.log("User found in MongoDB:", Boolean(user));

  return user;
}





export async function findUserById(id) {
  await connectDB();
  return User.findById(id);
}

export async function createUser(data) {
  await connectDB();
  return User.create(data);
}

export async function findPendingSellers() {
  await connectDB();
  return User.find({
    role: "seller",
    status: "pending",
  }).select("name email storeName status createdAt")
  .sort({createdAt: -1})
  .lean();
}

export async function approveSellerById(id) {
  await connectDB();
  return User.findOneAndUpdate({
    _id: id,
    role: "seller",
    status: "pending",
  },
{
  $set: { status: "active"},
},
{
  new: true,
}).select("name email storeName status");
}