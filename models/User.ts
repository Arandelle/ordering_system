import mongoose, { models, Schema } from "mongoose";
import { Ruge_Boogie } from "next/font/google";

const UserSchema = new Schema({
  _id: {
    type: String,
    require: [true, "Customer ID is required"],
    trim: true,
  },
  name: {
    type: String,
    require: [true, "Customer Name is Required"],
    trim: true,
  },
  email: {
    type: String,
    require: [true, "Customer Email is reqruired"],
  },
  emailVerified: {
    type: Boolean,
    require: true,
  },
  image: {
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

export const User = models.User || mongoose.model("User", UserSchema);
