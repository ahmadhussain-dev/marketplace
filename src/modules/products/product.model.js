import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    categoryId:{
      type:  mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    priceMinor: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
     stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

productSchema.index(
  { storeId: 1, sku: 1 },
  { unique: true }
);

productSchema.index({
  status: 1,
  isDeleted: 1,
  categoryId: 1,
  createdAt: -1,
});

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
