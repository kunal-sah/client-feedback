import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    // Verify the code is either a valid 2FA code or a backup code
    const isValidCode = user.backupCodes.includes(code);

    if (!isValidCode) {
      return new NextResponse("Invalid verification code", { status: 400 });
    }

    // Remove the used backup code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: {
          set: user.backupCodes.filter(c => c !== code),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[2FA_DISABLE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 