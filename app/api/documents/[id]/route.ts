import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import Document from "@/lib/db/models/document";
import DocumentVersion from "@/lib/db/models/documentVersion";
import Client from "@/lib/db/models/client";
import { verifyPin, encryptPassword } from "@/lib/auth/hash";

// GET document (without password)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    params = await params;
    const documentId = params.id;

    await connectToDatabase();

    const document = await Document.findById(documentId).select("-encryptedPassword");

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ document }, { status: 200 });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { message: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

// UPDATE document
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    params = await params;

    const { username, email, mobileNumber, password, pin } = await req.json();
    const documentId = params.id;

    if (!username || !password || !pin) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get the current document
    const document = await Document.findById(documentId);

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

    // Verify PIN
    const isPinValid = await verifyPin(pin, client.pinHash);
    
    if (!isPinValid) {
      return NextResponse.json(
        { message: "Invalid PIN" },
        { status: 401 }
      );
    }

    // Save current version to version history
    const documentVersion = new DocumentVersion({
      documentId: document._id,
      clientId: document.clientId,
      socialMedia: document.socialMedia,
      username: document.username,
      email: document.email,
      mobileNumber: document.mobileNumber,
      encryptedPassword: document.encryptedPassword,
    });

    await documentVersion.save();

    // Encrypt new password
    const encryptedPassword = encryptPassword(password, pin);

    // Update document
    document.username = username;
    document.email = email;
    document.mobileNumber = mobileNumber;
    document.encryptedPassword = encryptedPassword;

    await document.save();

    return NextResponse.json({ 
      message: "Document updated successfully",
      document: {
        _id: document._id,
        socialMedia: document.socialMedia,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Document update error:", error);
    return NextResponse.json(
      { message: "Failed to update document" },
      { status: 500 }
    );
  }
}