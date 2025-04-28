import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongoose";
import DocumentVersion from "@/lib/db/models/documentVersion";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    params = await params;

    const documentId = params.id;

    if (!documentId) {
      return NextResponse.json(
        { message: "Missing document ID" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get all versions for this document, sorted by creation date (newest first)
    const versions = await DocumentVersion.find({ documentId })
      .sort({ createdAt: -1 })

    return NextResponse.json({ versions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching document versions:", error);
    return NextResponse.json(
      { message: "Failed to fetch document versions" },
      { status: 500 }
    );
  }
}