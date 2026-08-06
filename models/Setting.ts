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
        unique: true,
      },
      viber: {
        type: String,
        match: [/^\+?[\d\s\-().]{7,15}$/, "Please enter a valid viber number"],
      },
    },
    operatingHours: {
      // Which days the store is open — e.g. ["Mon", "Tue", "Wed", "Thu", "Fri"]
      days: [
        {
          type: String,
          enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          default: []
        },
      ],
      openTime: {
        type: String,
          default: "10:00",
        match: [/^\d{2}:\d{2}$/, "Use HH:MM format"],
      },
      closeTime: {
        type: String,
        default: "23:00",
        match: [/^\d{2}:\d{2}$/, "Use HH:MM format"],
      },
      isClosed: { type: Boolean, default: false },
    },
    globalMaxActiveOrders: {
      type: Number,
      default: null,
      min: 1,
    },
    globalMaxReservationsPerHour: {
      type: Number,
      default: null,
      min: 1,
    },
    globalMaxReservationsPerDay: {
      type: Number,
      default: null,
      min: 1,
    },
    // When true, all branches share one global capacity pool.
    // Active orders across every branch are counted together
    // against globalMaxActiveOrders, so if one branch is full,
    // all branches show "high demand".
    isGlobalCapacityShared: {
      type: Boolean,
      default: false,
    },
    // Global free delivery toggle — replaces the NEXT_PUBLIC_FREE_DELIVERY_ENABLED env var.
    // When false, free delivery is disabled for all branches regardless of per-branch settings.
    freeDeliveryEnabled: {
      type: Boolean,
      default: false,
    },
    // Minimum item subtotal (in PHP) to qualify for free delivery.
    freeDeliveryMinimumPurchase: {
      type: Number,
      default: 549,
      min: 0,
    },
    // Maximum distance (in km) from branch to qualify for free delivery.
    freeDeliveryMaxDistanceKm: {
      type: Number,
      default: 5,
      min: 0,
    },
    // Global Cash on Delivery toggle.
    // When false, COD is disabled for all branches unless a branch explicitly
    // overrides with its own codEnabled = "enabled".
    // When true, COD is available for all branches unless a branch explicitly
    // overrides with codEnabled = "disabled".
    codEnabled: {
      type: Boolean,
      default: false,
    },
    // Admin-configured list of cities where delivery is available.
    // Each entry stores the PSGC city code + display name for reliable matching.
    // When empty, no city-level restriction is applied.
    deliveryAreas: [
      {
        cityCode: { type: String, required: true },
        cityName: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Settings =
  models.Settings || mongoose.model("Settings", SettingsSchema);