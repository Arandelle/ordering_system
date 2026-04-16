import mongoose, { Schema, Document } from "mongoose";

const AccountSchema = new Schema({
  _id: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  accountId: {
    type: String,
    required: true,
    trim: true,
  },
  providerId: {
    type: String,
    required: true,
    trim: true,
  },

  accessToken: {
    type: String,
    trim: true,
  },
  refreshToken: {
    type: String,
    trim: true,
  },

  accessTokenExpiresAt: {
    type: Date,
    trim: true,
  },
  refreshTokenExpiresAt: {
    type: Date,
    trim: true,
  },
  scope: {
    type: String,
    trim: true,
  },
  idToken: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    require: true,
  },
  updatedAt: {
    type: Date,
    require: true,
  },
});

export default mongoose.model("Account", AccountSchema) ||
  mongoose.model("Session", AccountSchema);
