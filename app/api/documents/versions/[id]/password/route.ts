import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import Document from "@/lib/db/models/document";
import Client from "@/lib/db/models/client";
import { verifyPin, decryptPassword } from "@/lib/auth/hash";
import documentVersion from "@/lib/db/models/documentVersion";

export async function POST(
  req: NextRequest,
  { params }: {  params: Promise<{ id: string }> }
) {
  try {
    const p = await params;

    const { pin } = await req.json();
    const documentId = p.id;

    if (!pin || !documentId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const document = await documentVersion.findById(documentId);

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    // Get the client to verify PIN
    const client = await Client.findById(document.clientId);

    if (!client) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    // Verify the PIN
    const isValid = await verifyPin(pin, client.pinHash);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid PIN" },
        { status: 401 }
      );
    }

    // Decrypt the password using the PIN
    const password = decryptPassword(document.encryptedPassword, pin);

    return NextResponse.json({ password }, { status: 200 });
  } catch (error) {
    console.error("Password decryption error:", error);
    return NextResponse.json(
      { message: "Failed to decrypt password" },
      { status: 500 }
    );
  }
}