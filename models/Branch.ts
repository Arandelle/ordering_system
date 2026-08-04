import mongoose, { models, Schema } from "mongoose";

const BranchSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Branch code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    address: {
      line1: {
        type: String,
        required: [true, "Branch address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      cityCode: {
        type: String,
        trim: true,
        default: "",
      },
      barangayCode: {
        type: String,
        trim: true,
        default: "",
      },
      province: {
        type: String,
        default: "Metro Manila",
        trim: true,
      },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude] — GeoJSON order - flip when saving
        required: true,
      },
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    deliveryRadiusKm: {
      type: Number,
      default: null,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    openingSoon: {
      type: Boolean,
      default: false,
    },
    maxActiveOrders: {
      type: Number,
      default: null,
      min: 1,
    },
    maxReservationsPerHour: {
      type: Number,
      default: null,
      min: 1,
    },
    maxReservationsPerDay: {
      type: Number,
      default: null,
      min: 1,
    },
    isBusy: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Branch = models.Branch || mongoose.model("Branch", BranchSchema);
