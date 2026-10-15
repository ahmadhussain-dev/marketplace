import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 80,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true
  }
);

export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema)