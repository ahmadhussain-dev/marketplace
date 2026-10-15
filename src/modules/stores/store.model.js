import mongoose from "mongoose";


const storeSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 120,
  },
  description: {
     type: String,
      trim: true,
      maxlength: 1000,
      default: "",
  },
  country: {
     type: String,
      required: true,
      uppercase: true,
      minlength: 2,
      maxlength: 3,
  },
  status: {
     type: String,
      enum: ["active", "suspended"],
      default: "active",
  }
}, {
  timestamps: true
}
);
export const Store = mongoose.models.Store || mongoose.model("Store", storeSchema );