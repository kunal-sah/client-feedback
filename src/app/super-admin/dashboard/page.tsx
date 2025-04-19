import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getMetrics() {
  const metrics = await prisma.$transaction(async (tx) => {
    const [
      activeCompanies,
      totalUsers,
      totalClients,
      totalSurveys,
      averageFeedbackScore
    ] = await Promise.all([
      tx.company.count({
        where: { status: "active" }
      }),
      tx.user.count(),
      tx.client.count(),
      tx.survey.count(),
      tx.response.aggregate({
        _avg: {
          rating: true
        }
      })
    ]);

    return {
      activeCompanies,
      totalUsers,
      totalClients,
      totalSurveys,
      averageFeedbackScore: averageFeedbackScore._avg.score || 0
    };
  });

  return metrics;
}

export default async function SuperAdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const metrics = await getMetrics();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Super Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Active Companies</h3>
          <p className="text-3xl font-bold">{metrics.activeCompanies}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{metrics.totalUsers}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Clients</h3>
          <p className="text-3xl font-bold">{metrics.totalClients}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Surveys</h3>
          <p className="text-3xl font-bold">{metrics.totalSurveys}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Avg. Feedback Score</h3>
          <p className="text-3xl font-bold">{metrics.averageFeedbackScore.toFixed(1)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/super-admin/companies">
          <Button className="w-full h-24 text-lg">
            Manage Companies
          </Button>
        </Link>
        
        <Link href="/super-admin/users">
          <Button className="w-full h-24 text-lg">
            Manage Users
          </Button>
        </Link>
        
        <Link href="/super-admin/analytics">
          <Button className="w-full h-24 text-lg">
            Analytics
          </Button>
        </Link>
        
        <Link href="/super-admin/roles">
          <Button className="w-full h-24 text-lg">
            Roles & Permissions
          </Button>
        </Link>
      </div>
    </div>
  );
} 