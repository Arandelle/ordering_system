import mongoose, { models, Schema } from "mongoose";

const SettingsSchema = new Schema(
  {
    storeName: { type: String, required: true },
    address: { type: String, required: true },
    contact: {
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^\+?[\d\s\-().]{7,15}$/, "Please enter a valid phone number"],
        select: false,
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        match: [
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          "Please fill a valid email address",
        ],
        unique: true
      },
    },
    operatingHours: [
      {
        day: {
          type: String,
          enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        open: { type: String, match: [/^\d{2}:\d{2}$/, "Use HH:MM format"] },
        close: { type: String, match: [/^\d{2}:\d{2}$/, "Use HH:MM format"] },
        closed: { type: Boolean, default: false },
      },
    ],
    taxRatePercent: { type: Number, required: true, min: 0, max: 1 },
  },
  { timestamps: true },
);

export const Settings =
  models.Settings || mongoose.model("Settings", SettingsSchema);
