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

    // Fetch metrics in parallel
    const [
      totalCompanies,
      totalEmployees,
      totalClients,
      totalSurveys
    ] = await Promise.all([
      prisma.company.count(),
      prisma.user.count({
        where: {
          role: 'TEAM_MEMBER'
        }
      }),
      prisma.user.count({
        where: {
          role: 'CLIENT'
        }
      }),
      prisma.survey.count()
    ]);

    return NextResponse.json({
      totalCompanies,
      totalEmployees,
      totalClients,
      totalSurveys
    });
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 