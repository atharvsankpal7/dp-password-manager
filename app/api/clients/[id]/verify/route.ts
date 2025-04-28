import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import Client from "@/lib/db/models/client";
import { verifyPin } from "@/lib/auth/hash";

export async function POST(
  req: NextRequest,
  { params }: {  params: Promise<{ id: string }> }
) {
  try {
    const p = await params;

    const { pin } = await req.json();
    const clientId = p.id;

    if (!pin || !clientId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const client = await Client.findById(clientId);

    if (!client) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    const isValid = await verifyPin(pin, client.pinHash);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid PIN" },
        { status: 401 }
      );
    }

    return NextResponse.json({ verified: true }, { status: 200 });
  } catch (error) {
    console.error("PIN verification error:", error);
    return NextResponse.json(
      { message: "Verification failed" },
      { status: 500 }
    );
  }
}