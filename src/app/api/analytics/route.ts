import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get total counts
    const [
      totalUsers,
      totalCompanies,
      totalClients,
      totalSurveys,
      totalResponses,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.client.count(),
      prisma.survey.count(),
      prisma.response.count(),
    ]);

    // Calculate average response rate
    const averageResponseRate = totalSurveys > 0
      ? (totalResponses / totalSurveys) * 100
      : 0;

    // Get recent activity
    const recentActivity = await prisma.activity.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get user growth data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
    });

    // Get company growth data (last 30 days)
    const companyGrowth = await prisma.company.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
    });

    // Get survey responses data (last 30 days)
    const surveyResponses = await prisma.response.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
    });

    // Calculate response rates (last 30 days)
    const responseRates = await Promise.all(
      Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return prisma.survey.findMany({
          where: {
            createdAt: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999)),
            },
          },
          include: {
            _count: {
              select: {
                responses: true,
              },
            },
          },
        });
      })
    );

    const formattedResponseRates = responseRates.map((surveys, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      const totalSurveys = surveys.length;
      const totalResponses = surveys.reduce(
        (sum, survey) => sum + survey._count.responses,
        0
      );
      const rate = totalSurveys > 0 ? (totalResponses / totalSurveys) * 100 : 0;

      return {
        date: date.toISOString().split('T')[0],
        rate: Math.round(rate * 100) / 100,
      };
    });

    return NextResponse.json({
      totalUsers,
      totalCompanies,
      totalClients,
      totalSurveys,
      totalResponses,
      averageResponseRate,
      recentActivity,
      userGrowth: userGrowth.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        count: item._count,
      })),
      companyGrowth: companyGrowth.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        count: item._count,
      })),
      surveyResponses: surveyResponses.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        count: item._count,
      })),
      responseRates: formattedResponseRates,
    });
  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 