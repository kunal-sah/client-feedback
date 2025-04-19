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
      include: { company: true }
    });

    if (!user?.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const surveys = await prisma.survey.findMany({
      where: { client: { companyId: user.company.id } },
      include: {
        _count: {
          select: { responses: true }
        }
      }
    });

    const responseRateData = surveys.map(survey => {
      const expectedResponses = survey.client.teamMembers.length;
      const totalResponses = survey._count.responses;
      const responseRate = expectedResponses > 0
        ? (totalResponses / expectedResponses) * 100
        : 0;

      return {
        surveyId: survey.id,
        surveyTitle: survey.title,
        totalResponses,
        expectedResponses,
        responseRate
      };
    });

    return NextResponse.json(responseRateData);
  } catch (error) {
    console.error('Error fetching response rates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 