import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Orders";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {

    await connectDB();

    const {id} = await context.params;
    const body = await request.json();
    const {status} = body;

    if(!status){
        return NextResponse.json({
            error: "Status is required!"
        }, {status: 400})
    }

    const updateOrder = await Order.findByIdAndUpdate(id, {status}, {new: true});
    if(!updateOrder){
        return NextResponse.json({
            error: "Order Not found!"
        }, {status: 404})
    };

    return NextResponse.json({
        _id: updateOrder._id.toString(),
        status: updateOrder.status
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
