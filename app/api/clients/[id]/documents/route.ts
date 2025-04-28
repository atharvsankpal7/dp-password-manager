import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import Document from "@/lib/db/models/document";
import Client from "@/lib/db/models/client";
import { verifyPin, encryptPassword } from "@/lib/auth/hash";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    params = await params;

    const { socialMedia, username, email, mobileNumber, password, pin } = await req.json();
    const clientId = params.id;

    if (!socialMedia || !username || !password || !pin || !clientId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if client exists
    const client = await Client.findById(clientId);
    
    if (!client) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    // Verify PIN
    const isPinValid = await verifyPin(pin, client.pinHash);
    
    if (!isPinValid) {
      return NextResponse.json(
        { message: "Invalid PIN" },
        { status: 401 }
      );
    }

    // Check if a document with this social media already exists for this client
    const existingDoc = await Document.findOne({
      clientId,
      socialMedia,
      isActive: true,
    });

    if (existingDoc) {
      return NextResponse.json(
        { message: `A credential for ${socialMedia} already exists` },
        { status: 400 }
      );
    }

    // Encrypt password using PIN
    const encryptedPassword = encryptPassword(password, pin);

    // Create new document
    const document = new Document({
      clientId,
      socialMedia,
      username,
      email,
      mobileNumber,
      encryptedPassword,
      isActive: true,
    });

    await document.save();

    return NextResponse.json({ 
      message: "Document created successfully",
      document: {
        _id: document._id,
        socialMedia: document.socialMedia,
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Document creation error:", error);
    return NextResponse.json(
      { message: "Failed to create document" },
      { status: 500 }
    );
  }
}