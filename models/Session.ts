import mongoose, { models, Schema } from "mongoose";

const SessionSchema = new Schema({
  _id: {
    type: String,
    require: true,
    trim: true,
  },
  UserId: {
    type: String,
    require: true,
    trim: true,
  },
  token: {
    type: String,
    require: true,
    trim: true,
  },
  expiresAt: {
    type: String,
    require: true,
    trim: true,
  },
  ipAddress: {
    type: String,
    require: false,
    trim: true,
  },
  userAgent: {
    type: String,
    require: false,
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

export const Sesion = models.Session || mongoose.model("Session", SessionSchema);
