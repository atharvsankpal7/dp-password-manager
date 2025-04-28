import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import Client from "@/lib/db/models/client";
import { hashPin } from "@/lib/auth/hash";

export async function POST(req: NextRequest) {
  try {
    const { name, pin } = await req.json();

    if (!name || !pin) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      return NextResponse.json(
        { message: "PIN must be exactly 4 digits" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Hash PIN for secure storage
    const pinHash = await hashPin(pin);

    const client = new Client({
      name,
      pinHash,
    });

    await client.save();

    return NextResponse.json({ 
      message: "Client created successfully",
      client: { 
        _id: client._id,
        name: client.name
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Client creation error:", error);
    return NextResponse.json(
      { message: "Failed to create client" },
      { status: 500 }
    );
  }
}