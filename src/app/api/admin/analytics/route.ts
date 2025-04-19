import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const timeRange = url.searchParams.get('timeRange') || '30d';

    // Calculate the start date based on the time range
    const startDate = new Date();
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Fetch user growth data
    const userGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Fetch survey metrics
    const surveyMetrics = await prisma.survey.groupBy({
      by: ['status', 'createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Fetch company distribution
    const companyDistribution = await prisma.company.groupBy({
      by: ['size'],
      _count: {
        id: true
      }
    });

    // Transform the data
    const transformedUserGrowth = userGrowth.map(entry => ({
      date: entry.createdAt.toISOString().split('T')[0],
      totalUsers: entry._count.id,
      activeUsers: Math.floor(entry._count.id * 0.8) // Simulated active users
    }));

    const transformedSurveyMetrics = surveyMetrics.reduce((acc: any[], entry) => {
      const date = entry.createdAt.toISOString().split('T')[0];
      const existing = acc.find(item => item.month === date);
      
      if (existing) {
        if (entry.status === 'COMPLETED') {
          existing.completed = entry._count.id;
        } else {
          existing.pending = entry._count.id;
        }
      } else {
        acc.push({
          month: date,
          completed: entry.status === 'COMPLETED' ? entry._count.id : 0,
          pending: entry.status !== 'COMPLETED' ? entry._count.id : 0
        });
      }
      
      return acc;
    }, []);

    const transformedCompanyDistribution = companyDistribution.map(entry => ({
      size: entry.size || 'Unknown',
      count: entry._count.id
    }));

    return NextResponse.json({
      userGrowth: transformedUserGrowth,
      surveyMetrics: transformedSurveyMetrics,
      companyDistribution: transformedCompanyDistribution
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 