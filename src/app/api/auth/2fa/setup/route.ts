import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateSecret, generateQRCode } from "@/lib/totp";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const secret = generateSecret();
    const qrCode = generateQRCode(secret, session.user.email);

    // Store the secret temporarily (it will be confirmed during verification)
    await prisma.user.update({
      where: { email: session.user.email },
      data: { twoFactorSecret: secret },
    });

    return NextResponse.json({ secret, qrCode });
  } catch (error) {
    console.error("[2FA_SETUP]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 