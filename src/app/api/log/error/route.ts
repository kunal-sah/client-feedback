import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { message, stack, componentStack, metadata } = await req.json();

    const errorLog = await prisma.errorLog.create({
      data: {
        message,
        stack,
        componentStack,
        metadata: metadata ? JSON.stringify(metadata) : null,
        userId: session?.user?.id,
        path: req.headers.get("referer") || null,
      },
    });

    return NextResponse.json({ success: true, errorLog });
  } catch (error) {
    console.error('Error logging failed:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
} 