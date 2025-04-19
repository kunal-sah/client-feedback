import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verifyToken, generateBackupCodes } from "@/lib/totp";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { code, secret } = await req.json();

    if (!code || !secret) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify the token
    const isValid = verifyToken(code, secret);

    if (!isValid) {
      return new NextResponse("Invalid verification code", { status: 400 });
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Enable 2FA and store backup codes
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        twoFactorEnabled: true,
        backupCodes,
      },
    });

    return NextResponse.json({ backupCodes });
  } catch (error) {
    console.error("[2FA_VERIFY]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 