import mongoose, { models, Schema } from "mongoose";

/**
 * ARCHIVED USER MODEL
 *
 * Centralized archive for permanently deleted customer accounts.
 * When a soft-deleted account passes its 30-day retention period,
 * the full user document + auth records are moved here.
 *
 * This preserves historical data (orders, reviews still reference the
 * original userId) while removing the user from the active collection.
 */

const ShippingAddressSchema = new Schema(
  {
    line1: { type: String, default: "" },
    line2: { type: String, default: "" },
    city: { type: String, default: "" },
    cityCode: { type: String, default: "" },
    province: { type: String, default: "" },
    region: { type: String, default: "" },
    regionCode: { type: String, default: "" },
    barangayCode: { type: String, default: "" },
    subMunicipality: { type: String, default: "" },
    subMunicipalityCode: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: String, default: "Philippines" },
    landmark: { type: String, default: "" },
    placeName: { type: String, default: "" },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false },
);

/** Snapshot of a Better Auth account record at deletion time */
const AuthAccountSchema = new Schema(
  {
    _id: String,
    accountId: String,
    providerId: String,
    accessToken: String,
    refreshToken: String,
    accessTokenExpiresAt: Date,
    refreshTokenExpiresAt: Date,
    scope: String,
    idToken: String,
    password: String,
    createdAt: Date,
    updatedAt: Date,
  },
  { _id: false },
);

const ArchivedUserSchema = new Schema(
  {
    // Original user document ID (preserved for order/review references)
    originalUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },

    // Snapshot of user fields at deletion time
    email: { type: String, required: true, index: true },
    name: String,
    firstName: String,
    lastName: String,
    phone: String,
    image: String,
    publicId: String,
    emailVerified: Boolean,
    termsAcceptedAt: String,
    shippingAddress: { type: ShippingAddressSchema, default: () => ({}) },

    // Auth accounts (credential, google) preserved for potential compliance audits
    authAccounts: { type: [AuthAccountSchema], default: [] },

    // Deletion metadata
    deletedAt: { type: Date, required: true },
    scheduledDeletionAt: { type: Date, required: true },
    deletionReason: String,

    // When the archive entry was created (= when hard delete happened)
    archivedAt: { type: Date, default: Date.now },

    // Aggregated stats at time of deletion (useful for admin reports)
    stats: {
      totalOrders: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

export const ArchivedUser =
  models.ArchivedUser ||
  mongoose.model("ArchivedUser", ArchivedUserSchema, "archived_users");
