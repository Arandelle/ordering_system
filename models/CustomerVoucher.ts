import mongoose, { model, models, Schema } from "mongoose";

const CustomerVoucherSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sourceOrderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      unique: true,
      sparse: true,
    },
    originalAmount: { type: Number, required: true, min: 0 },
    balance: { type: Number, required: true, min: 0 },
    minimumPurchase: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["active", "used", "void"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

CustomerVoucherSchema.index({ customerId: 1, status: 1, createdAt: -1 });

export const CustomerVoucher =
  models.CustomerVoucher || model("CustomerVoucher", CustomerVoucherSchema);
