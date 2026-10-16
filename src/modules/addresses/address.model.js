import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  line1: {
    type: String,
    required: true,
    trim: true,
  },
  line2: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
    region: {
      type: String,
      trim: true,
      default: "",
    },
    postalCode: {
      type: String,
      trim: true,
      default: "",
    },
     country: {
      type: String,
      required: true,
      uppercase: true,
    },
},
{timestamps: true});

export const Address = mongoose.models.Address || mongoose.model("Address", addressSchema);