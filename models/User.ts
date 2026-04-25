import mongoose, { models, Schema } from "mongoose";

const ShippingAddressSchema = new Schema(
  {
    line1:     { type: String, default: "" },
    line2:     { type: String, default: "" },
    city:      { type: String, default: "" },
    province:  { type: String, default: "" },
    zipCode:   { type: String, default: "" },
    country:   { type: String, default: "Philippines" },
    landmark:  { type: String, default: "" },
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    firstName: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    image: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    // Default shipping address saved on profile
    shippingAddress: {
      type: ShippingAddressSchema,
      required: false,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const User = models.User || mongoose.model("User", UserSchema, "user");