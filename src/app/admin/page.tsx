import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueMetrics } from "@/components/admin/revenue-metrics";
import { UserGrowth } from "@/components/admin/user-growth";
import { SurveyMetrics } from "@/components/admin/survey-metrics";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing the platform",
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  // Get the last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, "yyyy-MM");
  }).reverse();

  // Fetch metrics
  const [
    monthlyRevenue,
    monthlyUsers,
    monthlySurveys,
    totalCompanies,
    totalUsers,
    totalSurveys,
    totalClients,
  ] = await Promise.all([
    // Monthly revenue data
    Promise.all(
      last6Months.map(async (month) => {
        const [year, monthNum] = month.split("-");
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0);

        const companies = await prisma.company.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            subscriptionTier: true,
          },
        });

        const revenue = companies.reduce((acc: number, company: { subscriptionTier: "FREE" | "BASIC" | "PREMIUM" | "ENTERPRISE" }) => {
          const prices = {
            FREE: 0,
            BASIC: 49,
            PREMIUM: 99,
            ENTERPRISE: 299,
          } as const;
          return acc + prices[company.subscriptionTier];
        }, 0);

        return {
          month: format(startDate, "MMM"),
          revenue,
          subscriptions: companies.length,
        };
      })
    ),

    // Monthly user data
    Promise.all(
      last6Months.map(async (month) => {
        const [year, monthNum] = month.split("-");
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0);

        const newUsers = await prisma.user.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        const activeUsers = await prisma.user.count({
          where: {
            lastLoginAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        return {
          month: format(startDate, "MMM"),
          newUsers,
          activeUsers,
          churnedUsers: Math.floor(Math.random() * 10), // Placeholder for actual churn calculation
        };
      })
    ),

    // Monthly survey data
    Promise.all(
      last6Months.map(async (month) => {
        const [year, monthNum] = month.split("-");
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0);

        const sent = await prisma.survey.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        const completed = await prisma.survey.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: "COMPLETED",
          },
        });

        return {
          month: format(startDate, "MMM"),
          sent,
          completed,
          responseRate: sent > 0 ? (completed / sent) * 100 : 0,
        };
      })
    ),

    // Total counts
    prisma.company.count(),
    prisma.user.count(),
    prisma.survey.count(),
    prisma.client.count(),
  ]);

  // Calculate derived metrics
  const totalRevenue = monthlyRevenue.reduce((acc, month) => acc + month.revenue, 0);
  const mrr = monthlyRevenue[monthlyRevenue.length - 1].revenue;
  const prevMrr = monthlyRevenue[monthlyRevenue.length - 2].revenue;
  const growthRate = ((mrr - prevMrr) / prevMrr) * 100;

  const activeUsers = monthlyUsers[monthlyUsers.length - 1].activeUsers;
  const totalChurned = monthlyUsers.reduce((acc, month) => acc + month.churnedUsers, 0);
  const churnRate = (totalChurned / totalUsers) * 100;

  const completedSurveys = monthlySurveys.reduce((acc, month) => acc + month.completed, 0);
  const averageResponseRate = monthlySurveys.reduce((acc, month) => acc + month.responseRate, 0) / monthlySurveys.length;

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <RevenueMetrics
        monthlyRevenue={monthlyRevenue}
        totalRevenue={totalRevenue}
        mrr={mrr}
        growthRate={growthRate}
      />

      <UserGrowth
        monthlyGrowth={monthlyUsers}
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        churnRate={churnRate}
      />

      <SurveyMetrics
        monthlySurveys={monthlySurveys}
        totalSurveys={totalSurveys}
        completedSurveys={completedSurveys}
        averageResponseRate={averageResponseRate}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Surveys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSurveys}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 