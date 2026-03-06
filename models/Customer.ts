import mongoose, { Schema } from "mongoose";

const CustomerSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Fullname is required!"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[0-9]{10,15}$/, "Invalid phone number"],
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
      minLength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

CustomerSchema.index({ email: 1 }, { unique: true });

export const Customer =
  mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
