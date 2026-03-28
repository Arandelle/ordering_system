import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { fullname, email, phone, password } = await request.json();
    if (!fullname || !email || !password) {
      return NextResponse.json(
        {
          error: "All required fields must be filled",
        },
        { status: 400 },
      );
    }

    const existingAccount = await Customer.findOne({email});
    if(existingAccount){
        return NextResponse.json({error: "Email is already exists"}, {status: 409})
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const data = await Customer.create({
        fullname,
        email,
        phone,
        password: hashedPassword,
    });

    const {password: _, ...dataToResponse} = data.toObject() 
 
    return NextResponse.json(dataToResponse, {status: 201})

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create an account" },
      { status: 500 },
    );
  }
}
