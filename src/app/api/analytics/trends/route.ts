import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfMonth, endOfMonth, format } from 'date-fns';

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

    // Get the last 6 months of data
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
        label: format(date, 'yyyy-MM')
      };
    }).reverse();

    const trendData = await Promise.all(
      months.map(async ({ start, end, label }) => {
        const responses = await prisma.response.findMany({
          where: {
            survey: {
              client: {
                companyId: user.company.id
              }
            },
            createdAt: {
              gte: start,
              lte: end
            }
          },
          include: {
            answers: {
              where: {
                question: {
                  type: 'RATING'
                }
              }
            }
          }
        });

        const totalScore = responses.reduce((sum, response) => {
          const ratingSum = response.answers.reduce((acc, answer) => {
            return acc + Number(answer.value);
          }, 0);
          return sum + (ratingSum / response.answers.length);
        }, 0);

        const averageScore = responses.length > 0
          ? totalScore / responses.length
          : 0;

        return {
          date: label,
          averageScore,
          responseCount: responses.length
        };
      })
    );

    return NextResponse.json(trendData);
  } catch (error) {
    console.error('Error fetching trend data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 