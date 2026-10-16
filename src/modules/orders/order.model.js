
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPriceMinor: { type: Number, required: true },
    lineTotalMinor: { type: Number, required: true },
  },
  { _id: false }
);

const fulfillmentSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    items: { type: [itemSchema], required: true },
    subtotalMinor: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    trackingNumber: {
  type: String,
  trim: true,
  maxlength: 100,
  default: "",
},

carrierName: {
  type: String,
  trim: true,
  maxlength: 100,
  default: "",
},

shippedAt: {
  type: Date,
  default: null,
},

deliveredAt: {
  type: Date,
  default: null,
},
  },
  { _id: true }
);


const orderEventSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    actorRole: {
      type: String,
      enum: ["seller", "admin"],
      required: true,
    },

    event: {
      type: String,
      required: true,
      maxlength: 80,
    },

    fulfillmentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    checkoutKey: {
      type: String,
      required: true,
    },
    fulfillmentGroups: {
      type: [fulfillmentSchema],
      required: true,
    },
    shippingAddress: {
      type: Object,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    subtotalMinor: {
      type: Number,
      required: true,
    },
    shippingMinor: {
      type: Number,
      required: true,
      default: 0,
    },
    taxMinor: {
      type: Number,
      required: true,
      default: 0,
    },
    totalMinor: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
    events: {
  type: [orderEventSchema],
  default: [],
},

codCollectionReference: {
  type: String,
  default: "",
},

codConfirmedAt: {
  type: Date,
  default: null,
},

codConfirmedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},
  },
  { timestamps: true }
);

orderSchema.index(
  { customerId: 1, checkoutKey: 1 },
  { unique: true }
);

export const Order =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);
