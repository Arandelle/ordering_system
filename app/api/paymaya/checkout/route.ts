import { getAuthHeader } from "@/lib/getAuthHeader";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Orders";
import { Product } from "@/models/Product";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { success } from "zod";

export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();
    const body = await request.json();

    const MINIMUM_AMOUNT = 100;
    const TAX_RATE = 0.12;

    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    // Never trust your front to calculate the total amount
    let recalculatedSubTotal = 0;
    const validatedItems = [];

    for (const cartItem of items) {
      if (!cartItem._id || !cartItem.quantity) {
        throw new Error("Invalid cart item.");
      }

      const product = await Product.findById(cartItem._id).session(session);

      if (!product) {
        throw new Error("Product not found!");
      }

      // Atomic stocu deduction (prevents race conditions)
      const updateResult = await Product.updateOne(
        { _id: cartItem._id, stock: { $gte: cartItem.quantity } },
        {
          $inc: { stock: -cartItem.quantity },
        },
        { session },
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error(
          `${product.name} only has ${product.stock} item(s) left in stock`,
        );
      }

      recalculatedSubTotal += product.price * cartItem.quantity;

      validatedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image.url,
        category: product.category,
        quantity: cartItem.quantity,
        totalAmount: {
          value: product.price * cartItem.quantity,
          currency: "PHP",
        },
      });
    }

    if (recalculatedSubTotal < MINIMUM_AMOUNT) {
      throw new Error(`Minimum order amount is ₱${MINIMUM_AMOUNT}`);
    }

    const tax = recalculatedSubTotal * TAX_RATE;
    const grandTotal = recalculatedSubTotal + tax;

    const publicKey = process.env.MAYA_PUBLIC_KEY;

    if (!publicKey) {
      throw new Error("Maya key not configured");
    }

    const payload = {
      totalAmount: {
        value: grandTotal,
        currency: "PHP",
        details: {
          discount: "0",
          tax,
          subTotal: recalculatedSubTotal,
        },
      },
      items: validatedItems,
      redirectUrl: {
        success: `http://localhost:3000/payment/success`,
        failure: `http://localhost:3000/payment/failed`,
        cancel: `http://localhost:3000/payment/cancel`,
      },
      requestReferenceNumber: `ORDER-${Date.now()}`,
    };

    const response = await fetch(
      "https://pg-sandbox.paymaya.com/checkout/v1/checkouts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message ?? "Maya checkout failed", details: data },
        { status: response.status },
      );
    }

    const order = await Order.create(
      [
        {
          status: "pending",
          items: validatedItems,
          paymentInfo: {
            checkoutId: data.checkoutId,
            checkoutUrl: data.redirectUrl,
            referenceNumber: payload.requestReferenceNumber,
          },
          total: { subTotal: recalculatedSubTotal, tax, total: grandTotal },
          timeline: { createdAt: new Date() },
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    // Return checkoutId and redirectUrl to the frontend
    return NextResponse.json({
        checkoutId: data.checkoutId,
        redirectUrl: data.redirectUrl
    }, { status: 201 });
  } catch (error) {
    await session.abortTransaction(); // roll back the deducted stocks
    session.endSession();
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to checkout!",
    });
  }
}
