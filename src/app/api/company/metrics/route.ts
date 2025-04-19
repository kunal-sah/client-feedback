import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's company ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true }
    });

    if (!user?.companyId) {
      return new NextResponse("Company not found", { status: 404 });
    }

    // Get total clients
    const totalClients = await prisma.client.count({
      where: { companyId: user.companyId }
    });

    // Get total employees (users in the company)
    const totalEmployees = await prisma.user.count({
      where: { companyId: user.companyId }
    });

    // Get total surveys
    const totalSurveys = await prisma.survey.count({
      where: { companyId: user.companyId }
    });

    // Get active surveys (status is not DRAFT)
    const activeSurveys = await prisma.survey.count({
      where: {
        companyId: user.companyId,
        status: { not: "DRAFT" }
      }
    });

    // Calculate response rate
    const totalResponses = await prisma.response.count({
      where: {
        survey: {
          companyId: user.companyId
        }
      }
    });

    const responseRate = totalSurveys > 0 
      ? Math.round((totalResponses / totalSurveys) * 100) 
      : 0;

    // Get recent activity
    const recentActivity = await prisma.survey.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        client: {
          select: {
            name: true,
            email: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      totalClients,
      totalEmployees,
      totalSurveys,
      activeSurveys,
      responseRate,
      recentActivity
    });
  } catch (error) {
    console.error("[COMPANY_METRICS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 