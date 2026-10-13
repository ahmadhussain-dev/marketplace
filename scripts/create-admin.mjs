
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/modules/users/user.model.js";


const uri = process.env.MONGO_URI;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

async function main() {
  if (!uri || !email || !password) {
    throw new Error("Missing admin environment variables");
  }

  if (password.length < 12) {
    throw new Error("Admin password must have 12+ characters");
  }

  await mongoose.connect(uri);

  await User.init();

  const existing = await User.findOne({ email });

  if (existing) {
    throw new Error("This email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    name: "Marketplace Administrator",
    email,
    passwordHash,
    role: "admin",
    status: "active",
  });

  console.log("Administrator created successfully");
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
