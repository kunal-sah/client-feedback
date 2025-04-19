import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { company: true },
    });

    if (!user?.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const [
      totalClients,
      totalTeamMembers,
      activeSurveys,
      surveys,
      recentActivity,
    ] = await Promise.all([
      prisma.client.count({
        where: { companyId: user.company.id },
      }),
      prisma.user.count({
        where: { companyId: user.company.id },
      }),
      prisma.survey.count({
        where: {
          companyId: user.company.id,
          status: 'IN_PROGRESS',
        },
      }),
      prisma.survey.findMany({
        where: { companyId: user.company.id },
        include: { responses: true },
      }),
      prisma.errorLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalResponses = surveys.reduce((acc, survey) => acc + survey.responses.length, 0);
    const averageResponseRate = surveys.length > 0
      ? (totalResponses / (surveys.length * totalTeamMembers)) * 100
      : 0;

    return NextResponse.json({
      totalClients,
      totalTeamMembers,
      activeSurveys,
      totalResponses,
      averageResponseRate,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 