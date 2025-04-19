import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch users with their company information
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        company: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      companyName: user.company?.name || 'N/A'
    }));

    return NextResponse.json(transformedUsers);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();
    const data = await request.json();

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    const { status } = data;
    if (!status) {
      return new NextResponse('Status is required', { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to update user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 