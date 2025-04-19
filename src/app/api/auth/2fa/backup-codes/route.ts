import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateBackupCodes } from "@/lib/totp";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { code } = await req.json();

    if (!code) {
      return new NextResponse("Missing verification code", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        twoFactorSecret: true,
        backupCodes: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify the code is a valid backup code
    const isValidCode = user.backupCodes.includes(code);

    if (!isValidCode) {
      return new NextResponse("Invalid backup code", { status: 400 });
    }

    // Generate new backup codes
    const newBackupCodes = generateBackupCodes();

    // Update user with new backup codes
    await prisma.user.update({
      where: { id: user.id },
      data: {
        backupCodes: {
          set: newBackupCodes,
        },
      },
    });

    return NextResponse.json({ backupCodes: newBackupCodes });
  } catch (error) {
    console.error("[BACKUP_CODES_REGENERATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 