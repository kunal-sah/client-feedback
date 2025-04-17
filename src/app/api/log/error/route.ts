import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const errorLog = await request.json();

    // Add user ID if available
    if (session?.user?.id) {
      errorLog.userId = session.user.id;
    }

    // Store error in database
    await prisma.errorLog.create({
      data: {
        message: errorLog.message,
        stack: errorLog.stack,
        componentStack: errorLog.componentStack,
        path: errorLog.path,
        userId: errorLog.userId,
        metadata: errorLog.metadata,
      },
    });

    // In development, also log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging failed:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
} 