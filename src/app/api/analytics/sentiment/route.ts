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

    const responses = await prisma.response.findMany({
      where: {
        survey: {
          client: {
            companyId: user.company.id
          }
        }
      },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    const sentimentData = responses.reduce((acc, response) => {
      const surveyId = response.surveyId;
      if (!acc[surveyId]) {
        acc[surveyId] = {
          surveyId,
          positive: 0,
          neutral: 0,
          negative: 0
        };
      }

      response.answers.forEach(answer => {
        if (answer.question.type === 'RATING') {
          const rating = Number(answer.value);
          if (rating >= 4) acc[surveyId].positive++;
          else if (rating === 3) acc[surveyId].neutral++;
          else acc[surveyId].negative++;
        }
      });

      return acc;
    }, {} as Record<string, { surveyId: string; positive: number; neutral: number; negative: number }>);

    return NextResponse.json(Object.values(sentimentData));
  } catch (error) {
    console.error('Error fetching sentiment data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 