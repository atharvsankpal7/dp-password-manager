import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/db/mongoose";
import User from "@/lib/db/models/user";
import { verifyPassword } from "@/lib/auth/hash";
import { createToken } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const { username, password1, password2 } = await req.json();

    if (!username || !password1 || !password2) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPassword1Valid = await verifyPassword(
      password1,
      user.password1Hash
    );
    const isPassword2Valid = await verifyPassword(
      password2,
      user.password2Hash
    );

    if (!isPassword1Valid || !isPassword2Valid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create token with 10-minute expiration
    const token = await createToken(
      {
        id: user._id,
        username: user.username,
      },
      "10m"
    );
      const c =  await cookies();
    // Set cookie
     c.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 10 * 60, // 10 minutes
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ message: "Login successful" }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 }
    );
  }
}
